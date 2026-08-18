"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Crosshair, MapPin, RotateCcw } from "lucide-react";
import * as THREE from "three";
import type { Pm01FactoryView } from "../contracts/visualization";

const PANORAMA_STOPS = [
  { id: "receiving", label: "Raw material receiving", image: "/plant-panoramas/chemical/01-receiving.png", nodeId: "receiving", hotspotLon: -72 },
  { id: "storage", label: "Raw material storage", image: "/plant-panoramas/chemical/02-storage.png", nodeId: "tank-farm", hotspotLon: -48 },
  { id: "production", label: "Production process", image: "/plant-panoramas/chemical/03-production.png", nodeId: "reaction", hotspotLon: 32 },
  { id: "quality", label: "Final output & QC", image: "/plant-panoramas/chemical/04-quality.png", nodeId: "quality", hotspotLon: -58 },
  { id: "packaging", label: "Packaging line", image: "/plant-panoramas/chemical/05-packaging.png", nodeId: "packaging", hotspotLon: -52 },
  { id: "warehouse", label: "Finished-goods warehouse", image: "/plant-panoramas/chemical/06-warehouse.png", nodeId: "finished-goods", hotspotLon: 48 },
  { id: "loading", label: "Loading & unloading dock", image: "/plant-panoramas/chemical/07-loading-dock.png", nodeId: "dispatch", hotspotLon: 54 }
] as const;

function vectorFromAngles(lon: number, lat: number, radius = 45) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const format = (value: number, digits = 1) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);

export function PlantPanoramaTour({
  view,
  onAsset
}: {
  view: Pm01FactoryView;
  onAsset: (assetId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotspotRef = useRef<HTMLButtonElement>(null);
  const [stopIndex, setStopIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stop = PANORAMA_STOPS[stopIndex] ?? PANORAMA_STOPS[0];
  const node = view.processNodes.find((candidate) => candidate.id === stop.nodeId) ?? null;
  const asset = view.assets.find((candidate) => node?.assetIds.includes(candidate.id)) ?? null;
  const nextStop = PANORAMA_STOPS[(stopIndex + 1) % PANORAMA_STOPS.length] ?? PANORAMA_STOPS[0];

  const goTo = (index: number) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setStopIndex((index + PANORAMA_STOPS.length) % PANORAMA_STOPS.length);
      setTransitioning(false);
    }, 260);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.SphereGeometry(50, 64, 40);
    geometry.scale(-1, 1, 1);
    const texture = new THREE.TextureLoader().load(stop.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    scene.add(new THREE.Mesh(geometry, material));

    let lon = 0;
    let lat = -2;
    let pointerX = 0;
    let pointerY = 0;
    let startLon = 0;
    let startLat = 0;
    let pointerDown = false;
    const target = new THREE.Vector3();
    const hotspotWorld = vectorFromAngles(stop.hotspotLon, -5);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      setDragging(true);
      pointerX = event.clientX;
      pointerY = event.clientY;
      startLon = lon;
      startLat = lat;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return;
      lon = startLon + (pointerX - event.clientX) * 0.14;
      lat = startLat + (event.clientY - pointerY) * 0.11;
    };
    const onPointerUp = (event: PointerEvent) => {
      pointerDown = false;
      setDragging(false);
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.035, 38, 92);
      camera.updateProjectionMatrix();
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      lat = Math.max(-72, Math.min(72, lat));
      target.copy(vectorFromAngles(lon, lat));
      camera.lookAt(target);
      renderer.render(scene, camera);
      const projected = hotspotWorld.clone().project(camera);
      const marker = hotspotRef.current;
      if (marker) {
        const facing = camera.getWorldDirection(new THREE.Vector3()).dot(hotspotWorld.clone().normalize());
        marker.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
        marker.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
        marker.style.opacity = facing > 0.18 ? "1" : "0";
        marker.style.pointerEvents = facing > 0.18 ? "auto" : "none";
      }
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [stop.hotspotLon, stop.image]);

  const tags = asset?.tags.slice(0, 3) ?? [];

  return (
    <section className={`pm-panorama ${transitioning ? "is-transitioning" : ""}`} aria-label="Chemical Industry Street View operational twin">
      <canvas ref={canvasRef} aria-label="Drag to look around the 360 degree plant panorama" />
      <header>
        <span>IMMERSIVE OPERATIONAL TWIN · STOP {stopIndex + 1}/{PANORAMA_STOPS.length}</span>
        <h2>{stop.label}</h2>
        <p>{dragging ? "Looking around…" : "Hold and drag to look around · scroll to zoom"}</p>
      </header>
      <div className="pm-panorama-tools">
        <button onClick={() => goTo(stopIndex - 1)} aria-label="Previous Street View location"><ChevronLeft size={15} /></button>
        <button onClick={() => goTo(0)} aria-label="Reset Street View tour"><RotateCcw size={14} /></button>
        <button onClick={() => goTo(stopIndex + 1)} aria-label="Next Street View location"><ChevronRight size={15} /></button>
      </div>
      <button
        ref={hotspotRef}
        className="pm-panorama-hotspot"
        onClick={() => asset && onAsset(asset.id)}
        disabled={!asset}
      >
        <Crosshair size={15} />
        <span>{asset ? `${asset.id} · ${asset.name}` : stop.label}<small>{node?.status ?? "NORMAL"} · {format(node?.throughputTonnesPerHour ?? 0, 2)} T/h</small></span>
      </button>
      <button className="pm-panorama-step" onClick={() => goTo(stopIndex + 1)} aria-label={`Move forward to ${nextStop.label}`}>
        <i><MapPin size={19} /></i><span>Move forward<small>{nextStop.label}</small></span><ChevronRight size={17} />
      </button>
      <nav className="pm-panorama-route" aria-label="Street View plant locations">
        {PANORAMA_STOPS.map((item, index) => <button key={item.id} className={index === stopIndex ? "active" : ""} onClick={() => goTo(index)} aria-label={`Open panorama: ${item.label}`}>{index + 1}</button>)}
      </nav>
      <aside className="pm-panorama-telemetry" aria-label="Current panorama equipment statistics">
        <span>OBSERVABLE EQUIPMENT DATA</span>
        <strong>{asset ? `${asset.id} · ${asset.name}` : stop.label}</strong>
        <div>{tags.map((tag) => <span key={tag.id}>{tag.name}<b>{typeof tag.value === "number" ? format(tag.value, 2) : String(tag.value)} <small>{tag.engineeringUnit}</small></b></span>)}</div>
      </aside>
      <p className="pm-panorama-boundary">Observable data only · simulated ground truth remains isolated.</p>
    </section>
  );
}
