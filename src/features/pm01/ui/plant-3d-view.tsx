"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Minus, Plus, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Plant3dViewProps = {
  industry: string;
  section: string;
  equipment: readonly string[];
  metrics: readonly (readonly [string, string])[];
};

type SceneRuntime = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  reset: () => void;
};

export function Plant3dView({ industry, section, equipment, metrics }: Plant3dViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06110e);
    scene.fog = new THREE.Fog(0x06110e, 19, 42);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(13, 10, 16);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 3;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(0, 1.4, 0);

    scene.add(new THREE.HemisphereLight(0xd8fff0, 0x0a1713, 2.15));
    const sun = new THREE.DirectionalLight(0xffffff, 3.3);
    sun.position.set(9, 15, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const accentLight = new THREE.PointLight(0x52e5b0, 30, 22);
    accentLight.position.set(-6, 5, -3);
    scene.add(accentLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 24),
      new THREE.MeshStandardMaterial({ color: 0x0b1b17, roughness: 0.82, metalness: 0.15 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(34, 34, 0x2f8f70, 0x17382f);
    grid.position.y = 0.012;
    scene.add(grid);

    const plant = new THREE.Group();
    scene.add(plant);
    const steel = new THREE.MeshStandardMaterial({
      color: 0x90a9a1,
      metalness: 0.78,
      roughness: 0.28
    });
    const darkSteel = new THREE.MeshStandardMaterial({
      color: 0x29443b,
      metalness: 0.7,
      roughness: 0.38
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x54ddb0,
      emissive: 0x103c2d,
      metalness: 0.35
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x72d7ba,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1
    });
    const positions = equipment.map((_, index) => ({
      x: (index % 4) * 5 - 7.5,
      z: Math.floor(index / 4) * 7 - 3.5
    }));

    positions.forEach((position, index) => {
      const unit = new THREE.Group();
      unit.position.set(position.x, 0, position.z);
      unit.userData.index = index;
      const variant = index % 4;
      if (variant === 0) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 4.2, 32), steel);
        tank.position.y = 2.25;
        tank.castShadow = true;
        unit.add(tank);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.22, 0.72, 32), steel);
        cap.position.y = 4.72;
        unit.add(cap);
      } else if (variant === 1) {
        const skid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.65, 2.4), darkSteel);
        skid.position.y = 1.05;
        skid.castShadow = true;
        unit.add(skid);
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.7, 24), accent);
        rotor.rotation.z = Math.PI / 2;
        rotor.position.y = 2.15;
        rotor.userData.animated = true;
        unit.add(rotor);
      } else if (variant === 2) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.96, 6.1, 28), steel);
        column.position.y = 3.15;
        column.castShadow = true;
        unit.add(column);
        for (let level = 1; level < 6; level += 1) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.06, 8, 28), accent);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = level;
          unit.add(ring);
        }
      } else {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.8, 3), glass);
        hall.position.y = 1.5;
        hall.castShadow = true;
        unit.add(hall);
        const line = new THREE.Mesh(new THREE.BoxGeometry(3, 0.42, 0.72), accent);
        line.position.y = 1.05;
        unit.add(line);
      }
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), accent);
      beacon.position.set(0, variant === 2 ? 6.45 : 5.2, 0);
      unit.add(beacon);
      plant.add(unit);
    });

    for (let index = 0; index < positions.length - 1; index += 1) {
      const current = positions[index]!;
      const next = positions[index + 1]!;
      const from = new THREE.Vector3(current.x, 1.1 + (index % 2), current.z);
      const to = new THREE.Vector3(next.x, 1.1 + (index % 2), next.z);
      const delta = to.clone().sub(from);
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, delta.length(), 12), accent);
      pipe.position.copy(from.clone().add(to).multiplyScalar(0.5));
      pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
      plant.add(pipe);
    }

    const reset = () => {
      camera.position.set(13, 10, 16);
      controls.target.set(0, 1.4, 0);
      controls.update();
    };
    runtimeRef.current = { camera, controls, renderer, reset };
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
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      plant.traverse((object) => {
        if (object.userData.animated) object.rotation.x += 0.012;
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      runtimeRef.current = null;
    };
  }, [equipment, industry, section]);

  const zoom = (factor: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const direction = runtime.camera.position.clone().sub(runtime.controls.target);
    runtime.camera.position.copy(
      runtime.controls.target.clone().add(direction.multiplyScalar(factor))
    );
    runtime.controls.update();
  };
  const orbit = (angle: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const offset = runtime.camera.position.clone().sub(runtime.controls.target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    runtime.camera.position.copy(runtime.controls.target.clone().add(offset));
    runtime.controls.update();
  };
  const toggleWalk = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const next = !walkMode;
    setWalkMode(next);
    runtime.camera.position.set(next ? -7 : 13, next ? 2.1 : 10, next ? 8 : 16);
    runtime.controls.target.set(next ? 0 : 0, next ? 1.65 : 1.4, next ? -1 : 0);
    runtime.controls.update();
  };

  return (
    <section className="pm-3d-view" aria-label={`${industry} ${section} interactive 3D plant`}>
      <canvas ref={canvasRef} aria-label="Interactive 3D plant model" />
      <header>
        <span>3D DIGITAL TWIN · {section}</span>
        <h2>{industry}</h2>
        <p>Drag to orbit · scroll to zoom · right-drag to pan</p>
      </header>
      <div className="pm-3d-controls" aria-label="3D camera controls">
        <button onClick={() => zoom(0.78)} aria-label="Zoom 3D model in">
          <Plus size={15} />
        </button>
        <button onClick={() => zoom(1.28)} aria-label="Zoom 3D model out">
          <Minus size={15} />
        </button>
        <button onClick={() => orbit(-0.35)} aria-label="Orbit 3D model left">
          <RotateCcw size={15} />
        </button>
        <button onClick={() => orbit(0.35)} aria-label="Orbit 3D model right">
          <RotateCw size={15} />
        </button>
        <button onClick={() => runtimeRef.current?.reset()} aria-label="Reset 3D camera">
          <ScanLine size={15} />
        </button>
        <button className={walkMode ? "active" : ""} onClick={toggleWalk} aria-pressed={walkMode}>
          <Box size={14} /> {walkMode ? "Exit walkaround" : "Walkaround"}
        </button>
      </div>
      <div className="pm-3d-equipment">
        {equipment.map((item, index) => (
          <button
            key={item}
            className={selected === index ? "active" : ""}
            onClick={() => setSelected(index)}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <span>
              {item}
              <small>{selected === index ? "Selected · live" : "Normal"}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="pm-3d-metrics" aria-label="Section operating statistics">
        {metrics.map(([label, value], index) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <i style={{ width: `${72 + index * 9}%` }} />
          </article>
        ))}
      </div>
    </section>
  );
}
