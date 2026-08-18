"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Minus, Plus, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Pm01FactoryView } from "../contracts/visualization";

type Plant3dViewProps = {
  industry: string;
  section: string;
  equipment: readonly string[];
  metrics: readonly (readonly [string, string])[];
  observableView: Pm01FactoryView | null;
  observableHistory: readonly Pm01FactoryView[];
  onAsset: (assetId: string) => void;
};

type SceneRuntime = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  reset: () => void;
};

type LiveSceneObject = {
  unit: THREE.Group;
  beacon: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
};

const PROCESS_NODE_MATCHERS: readonly (readonly [RegExp, string])[] = [
  [/tank|raw|receiv/i, "tank-farm"],
  [/feed/i, "feed"],
  [/react/i, "reaction"],
  [/separ/i, "separation"],
  [/finish|dry/i, "finishing"],
  [/pack|fill/i, "packaging"],
  [/warehouse|cold|finished/i, "finished-goods"],
  [/dispatch|loading/i, "dispatch"]
];

function nodeForEquipment(view: Pm01FactoryView | null, equipment: string) {
  if (!view) return null;
  const id = PROCESS_NODE_MATCHERS.find(([matcher]) => matcher.test(equipment))?.[1];
  return view.processNodes.find((node) => node.id === id) ?? null;
}

function displayNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
}

export function Plant3dView({
  industry,
  section,
  equipment,
  metrics,
  observableView,
  observableHistory,
  onAsset
}: Plant3dViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const liveObjectsRef = useRef<LiveSceneObject[]>([]);
  const [walkMode, setWalkMode] = useState(false);
  const [selected, setSelected] = useState(0);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const displayedView =
    replayIndex === null
      ? observableView
      : (observableHistory[Math.min(replayIndex, observableHistory.length - 1)] ?? observableView);
  const connected = observableView !== null;
  const selectedNode = nodeForEquipment(displayedView, equipment[selected] ?? "");
  const selectedAsset = displayedView?.assets.find((asset) =>
    selectedNode?.assetIds.includes(asset.id)
  );

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
    const hygienicSteel = new THREE.MeshStandardMaterial({
      color: 0xd8e3e0,
      metalness: 0.86,
      roughness: 0.18
    });
    const concrete = new THREE.MeshStandardMaterial({
      color: 0x52635e,
      metalness: 0.08,
      roughness: 0.82
    });
    const product = new THREE.MeshStandardMaterial({
      color: 0xe9f7f3,
      metalness: 0.12,
      roughness: 0.52
    });
    const industryKey = industry.toLowerCase().includes("dairy")
      ? "dairy"
      : industry.toLowerCase().includes("sugar")
        ? "sugar"
        : industry.toLowerCase().includes("msme")
          ? "msme"
          : industry.toLowerCase().includes("clean-tech")
            ? "clean-tech"
            : "chemical";
    const layouts: Record<string, readonly { x: number; z: number }[]> = {
      dairy: [
        { x: -8.5, z: -3.8 }, { x: -5.8, z: -3.8 }, { x: -2.5, z: -3.8 },
        { x: 1, z: -3.8 }, { x: 4.5, z: -3.8 }, { x: 8, z: -3.8 },
        { x: 4.8, z: 3.6 }, { x: 8.2, z: 3.6 }
      ],
      chemical: [
        { x: -8, z: -4 }, { x: -3.7, z: -4 }, { x: 0, z: -3.5 },
        { x: 4.2, z: -3.5 }, { x: 8, z: -3.5 }, { x: 7, z: 3.7 },
        { x: 2.5, z: 3.7 }, { x: -4.5, z: 3.7 }
      ],
      msme: [
        { x: -8, z: -3.8 }, { x: -4, z: -3.8 }, { x: 0, z: -3.8 },
        { x: 4, z: -3.8 }, { x: 8, z: -3.8 }, { x: 5.5, z: 3.8 },
        { x: 0.5, z: 3.8 }, { x: -5.5, z: 3.8 }
      ],
      "clean-tech": [
        { x: -9, z: -4 }, { x: -6, z: -3 }, { x: -2.5, z: -3 },
        { x: 1.5, z: -2.5 }, { x: 6, z: -2.5 }, { x: 8.5, z: 3.5 },
        { x: 3.5, z: 4 }, { x: -4, z: 4 }
      ],
      sugar: [
        { x: -9, z: -3.8 }, { x: -6, z: -3.8 }, { x: -2.5, z: -3.8 },
        { x: 1, z: -3.8 }, { x: 4.5, z: -3.8 }, { x: 8, z: -3.8 },
        { x: 4, z: 3.8 }, { x: -3, z: 3.8 }
      ]
    };
    const positions = equipment.map((_, index) =>
      layouts[industryKey]![index] ?? { x: (index % 4) * 5 - 7.5, z: Math.floor(index / 4) * 7 - 3.5 }
    );
    const liveObjects: LiveSceneObject[] = [];

    const addBox = (
      unit: THREE.Group,
      size: [number, number, number],
      position: [number, number, number],
      material: THREE.Material = darkSteel
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      unit.add(mesh);
      return mesh;
    };
    const addTank = (
      unit: THREE.Group,
      radius: number,
      height: number,
      position: [number, number, number],
      horizontal = false,
      material: THREE.Material = steel
    ) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 28), material);
      mesh.position.set(...position);
      if (horizontal) mesh.rotation.z = Math.PI / 2;
      mesh.castShadow = true;
      unit.add(mesh);
      return mesh;
    };

    const buildDairyUnit = (unit: THREE.Group, item: string) => {
      if (/reception/i.test(item)) {
        addBox(unit, [3.4, 0.22, 2.8], [0, 3.15, 0], product);
        addBox(unit, [0.14, 3.1, 0.14], [-1.5, 1.55, -1.1], hygienicSteel);
        addBox(unit, [0.14, 3.1, 0.14], [1.5, 1.55, -1.1], hygienicSteel);
        addTank(unit, 0.72, 2.7, [0, 1.1, 0.2], true, hygienicSteel);
        addBox(unit, [0.55, 0.55, 0.55], [-1.25, 0.35, 0.2], accent);
        return 3.4;
      }
      if (/chill|storage/i.test(item) && !/cold/i.test(item)) {
        [-0.75, 0.75].forEach((z) => {
          addTank(unit, 0.72, 2.8, [0, 1.05, z], true, hygienicSteel);
          addBox(unit, [0.15, 0.65, 0.15], [-0.85, 0.35, z], darkSteel);
          addBox(unit, [0.15, 0.65, 0.15], [0.85, 0.35, z], darkSteel);
        });
        return 2.2;
      }
      if (/separation/i.test(item)) {
        addTank(unit, 1.05, 0.85, [0, 1.05, 0], false, hygienicSteel);
        const bowl = new THREE.Mesh(new THREE.ConeGeometry(0.92, 1.35, 28), hygienicSteel);
        bowl.rotation.x = Math.PI;
        bowl.position.y = 2.1;
        bowl.castShadow = true;
        unit.add(bowl);
        addBox(unit, [1, 0.55, 0.72], [1.1, 0.55, 0], accent).userData.animated = true;
        return 3;
      }
      if (/pasteur/i.test(item)) {
        for (let plate = -5; plate <= 5; plate += 1) {
          addBox(unit, [0.08, 2.5, 1.7], [plate * 0.16, 1.55, 0], plate % 2 ? accent : hygienicSteel);
        }
        addBox(unit, [2.4, 0.18, 2], [0, 0.25, 0], darkSteel);
        return 3.1;
      }
      if (/homogen/i.test(item)) {
        addBox(unit, [3, 0.28, 2], [0, 0.25, 0], darkSteel);
        [-0.8, 0, 0.8].forEach((x) => addTank(unit, 0.42, 1.5, [x, 1.15, 0], true, hygienicSteel));
        addBox(unit, [0.9, 0.9, 1.2], [1.3, 0.85, 0], accent).userData.animated = true;
        return 2.1;
      }
      if (/filling/i.test(item)) {
        addBox(unit, [3.6, 0.32, 1.25], [0, 0.68, 0], darkSteel);
        for (let bottle = -4; bottle <= 4; bottle += 1) {
          addTank(unit, 0.11, 0.7, [bottle * 0.38, 1.2, 0], false, product);
        }
        addBox(unit, [2.2, 2.3, 1.8], [0, 1.65, 0], glass);
        return 3;
      }
      if (/cold/i.test(item)) {
        addBox(unit, [4.2, 3.4, 3.4], [0, 1.75, 0], product);
        addBox(unit, [1.2, 2.2, 0.12], [0, 1.2, 1.76], darkSteel);
        [-1.25, 1.25].forEach((x) => addTank(unit, 0.42, 0.22, [x, 2.75, 1.76], true, accent));
        return 3.7;
      }
      addBox(unit, [4.1, 1.1, 2.6], [0, 0.65, 0], concrete);
      addBox(unit, [2.2, 1.7, 2.2], [0.65, 1.65, 0], product);
      return 2.7;
    };

    const buildIndustrialUnit = (unit: THREE.Group, item: string, index: number) => {
      if (industryKey === "msme") {
        addBox(unit, [3.2, 0.25, 2.4], [0, 0.25, 0], concrete);
        if (/press/i.test(item)) {
          addBox(unit, [2.2, 2.8, 0.45], [0, 1.65, -0.8], darkSteel);
          addBox(unit, [1.3, 0.45, 1.5], [0, 1.65, 0], accent).userData.animated = true;
        } else if (/weld|robot/i.test(item)) {
          addTank(unit, 0.25, 1.8, [0, 1.15, 0], false, accent).userData.animated = true;
          addTank(unit, 0.2, 1.5, [0.65, 2.1, 0], true, accent);
        } else {
          addBox(unit, [2.6, 2.2, 2], [0, 1.35, 0], index % 2 ? glass : steel);
          addBox(unit, [1.55, 0.8, 1.2], [0, 1.15, 1], accent).userData.animated = true;
        }
        return 3.2;
      }
      if (industryKey === "clean-tech") {
        if (/conveyor|loader/i.test(item)) {
          const belt = addBox(unit, [4.4, 0.25, 1], [0, 1.35, 0], darkSteel);
          belt.rotation.z = 0.16;
          addBox(unit, [4.2, 0.1, 0.74], [0, 1.58, 0], accent).rotation.z = 0.16;
          return 2.5;
        }
        if (/absorber|silo/i.test(item)) {
          addTank(unit, /absorber/i.test(item) ? 1.35 : 1, /absorber/i.test(item) ? 6.4 : 4.5, [0, /absorber/i.test(item) ? 3.3 : 2.35, 0], false, steel);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(/absorber/i.test(item) ? 1.35 : 1, 1, 28), steel);
          cone.position.y = /absorber/i.test(item) ? 7 : 5.1;
          unit.add(cone);
          return /absorber/i.test(item) ? 7.4 : 5.5;
        }
        addBox(unit, [3.5, 3.5, 2.8], [0, 1.8, 0], index % 2 ? glass : concrete);
        for (let cell = -1; cell <= 1; cell += 1) addBox(unit, [0.65, 2.5, 2.2], [cell * 0.9, 1.55, 0], accent);
        return 4;
      }
      if (industryKey === "sugar") {
        if (/yard|mill/i.test(item)) {
          addBox(unit, [4, 0.35, 2.2], [0, 0.5, 0], darkSteel);
          [-0.85, 0, 0.85].forEach((x) => addTank(unit, 0.5, 1.8, [x, 1.25, 0], true, steel).userData.animated = true);
          return 2.2;
        }
        if (/evapor|cryst/i.test(item)) {
          [-0.9, 0.9].forEach((x) => addTank(unit, 0.78, 4.4, [x, 2.3, 0], false, hygienicSteel));
          return 4.8;
        }
        if (/bag/i.test(item)) {
          addBox(unit, [4, 0.35, 1.3], [0, 0.7, 0], accent);
          for (let bag = -3; bag <= 3; bag += 1) addBox(unit, [0.38, 0.65, 0.7], [bag * 0.52, 1.2, 0], product);
          return 2;
        }
        addTank(unit, 1.25, 3.1, [0, 1.65, 0], false, steel);
        return 3.6;
      }
      if (/tank|raw/i.test(item)) {
        [-0.9, 0.9].forEach((x) => addTank(unit, 0.8, 3.6, [x, 1.9, 0], false, steel));
        return 4;
      }
      if (/react|column|separ/i.test(item)) {
        addTank(unit, 1.05, /column|separ/i.test(item) ? 6 : 4.6, [0, /column|separ/i.test(item) ? 3.1 : 2.4, 0], false, darkSteel);
        for (let level = 1; level < 6; level += 1) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 8, 28), accent);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = level;
          unit.add(ring);
        }
        return 6.5;
      }
      addBox(unit, [3.5, 2.8, 3], [0, 1.5, 0], glass);
      addBox(unit, [3, 0.42, 0.72], [0, 1.05, 0], accent).userData.animated = true;
      return 3.4;
    };

    positions.forEach((position, index) => {
      const unit = new THREE.Group();
      unit.position.set(position.x, 0, position.z);
      unit.userData.index = index;
      const height = industryKey === "dairy"
        ? buildDairyUnit(unit, equipment[index]!)
        : buildIndustrialUnit(unit, equipment[index]!, index);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), accent);
      beacon.position.set(0, height + 0.25, 0);
      unit.add(beacon);
      plant.add(unit);
      liveObjects.push({ unit, beacon });
    });
    liveObjectsRef.current = liveObjects;

    for (let index = 0; index < positions.length - 1; index += 1) {
      const current = positions[index]!;
      const next = positions[index + 1]!;
      const from = new THREE.Vector3(current.x, 1.1 + (index % 2), current.z);
      const to = new THREE.Vector3(next.x, 1.1 + (index % 2), next.z);
      const delta = to.clone().sub(from);
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, delta.length(), 12),
        accent.clone()
      );
      pipe.position.copy(from.clone().add(to).multiplyScalar(0.5));
      pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
      pipe.userData.flowIndex = index;
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
        if (typeof object.userData.flowIndex === "number") {
          const source = liveObjects[object.userData.flowIndex];
          const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (source?.unit.userData.flowActive) {
            material.emissiveIntensity = 0.75 + Math.sin(Date.now() / 180) * 0.2;
          }
        }
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
      liveObjectsRef.current = [];
    };
  }, [equipment, industry, section]);

  useEffect(() => {
    liveObjectsRef.current.forEach(({ unit, beacon }, index) => {
      const node = nodeForEquipment(displayedView, equipment[index] ?? "");
      const status = node?.status ?? (connected ? "OFFLINE" : "NORMAL");
      const color =
        status === "CRITICAL"
          ? 0xff5a5f
          : status === "WARNING"
            ? 0xf4b942
            : status === "OFFLINE"
              ? 0x60736c
              : 0x54ddb0;
      beacon.material.color.setHex(color);
      beacon.material.emissive.setHex(color);
      beacon.material.emissiveIntensity = node?.active ? 1.6 : 0.35;
      beacon.scale.setScalar(node?.active ? 1.55 : 1);
      unit.userData.flowActive = Boolean(node?.active);
      unit.scale.setScalar(index === selected ? 1.05 : 1);
    });
  }, [connected, displayedView, equipment, selected]);

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
        <span>{connected ? "CONNECTED OPERATIONAL TWIN" : "3D INDUSTRY MODEL"} · {section}</span>
        <h2>{industry}</h2>
        <p>
          {connected
            ? `${displayedView?.run.status ?? "OFFLINE"} · observable telemetry · ${replayIndex === null ? "LIVE" : "HISTORICAL REPLAY"}`
            : "Illustrative geometry · deterministic industry model pending"}
        </p>
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
            onClick={() => {
              setSelected(index);
              const node = nodeForEquipment(displayedView, item);
              const assetId = node?.assetIds[0];
              if (assetId) onAsset(assetId);
            }}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <span>
              {item}
              <small>
                {connected
                  ? `${nodeForEquipment(displayedView, item)?.status ?? "Offline"} · ${nodeForEquipment(displayedView, item)?.throughputTonnesPerHour.toFixed(2) ?? "0.00"} T/h`
                  : selected === index
                    ? "Selected · illustrative"
                    : "Illustrative"}
              </small>
            </span>
          </button>
        ))}
      </div>
      <div className="pm-3d-metrics" aria-label="Section operating statistics">
        {(connected && displayedView
          ? [
              ["Production rate", `${displayNumber(displayedView.kpis.productionRateTonnesPerDay)} T/day`],
              ["OEE", `${displayNumber(displayedView.kpis.oee.oee * 100)}%`],
              [
                "Energy intensity",
                displayedView.kpis.energyPerTonne === null
                  ? "—"
                  : `${displayNumber(displayedView.kpis.energyPerTonne)} kWh-eq/T`
              ]
            ]
          : metrics
        ).map(([label, value], index) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <i style={{ width: `${72 + index * 9}%` }} />
          </article>
        ))}
      </div>
      {connected && selectedNode && (
        <aside className="pm-twin-asset-panel" aria-label="Selected asset live telemetry">
          <header>
            <span>SELECTED ASSET · {selectedNode.status}</span>
            <strong>{selectedAsset ? `${selectedAsset.id} · ${selectedAsset.name}` : selectedNode.title}</strong>
            <small>
              {displayNumber(selectedNode.inventoryTonnes)} T held · {displayNumber(selectedNode.throughputTonnesPerHour, 2)} T/h
            </small>
          </header>
          <div className="pm-twin-tags">
            {(selectedAsset?.tags.slice(0, 3) ?? []).map((tag) => {
              const samples = observableHistory
                .map((snapshot) =>
                  snapshot.assets
                    .find((asset) => asset.id === selectedAsset?.id)
                    ?.tags.find((candidate) => candidate.id === tag.id)?.value
                )
                .filter((value): value is number => typeof value === "number")
                .slice(-18);
              const maximum = Math.max(...samples, 1);
              return (
                <div key={tag.id}>
                  <span>{tag.name}</span>
                  <strong>
                    {typeof tag.value === "number" ? displayNumber(tag.value, 2) : String(tag.value)}{" "}
                    <small>{tag.engineeringUnit}</small>
                  </strong>
                  <i aria-label={`${tag.name} recent observable trend`}>
                    {samples.map((sample, index) => (
                      <b key={index} style={{ height: `${Math.max(8, (sample / maximum) * 100)}%` }} />
                    ))}
                  </i>
                </div>
              );
            })}
            {selectedAsset?.tags.length === 0 && <p>No configured observable tags.</p>}
          </div>
          <button onClick={() => selectedAsset && onAsset(selectedAsset.id)} disabled={!selectedAsset}>
            Open asset record
          </button>
        </aside>
      )}
      {connected && observableHistory.length > 0 && (
        <div className="pm-twin-replay" aria-label="Observable history replay">
          <button
            className={replayIndex === null ? "active" : ""}
            onClick={() => setReplayIndex(null)}
          >
            Live
          </button>
          <span>{replayIndex === null ? "LIVE" : "REPLAY"}</span>
          <input
            aria-label="Replay observable history"
            type="range"
            min={0}
            max={Math.max(0, observableHistory.length - 1)}
            value={replayIndex ?? observableHistory.length - 1}
            onChange={(event) => setReplayIndex(Number(event.target.value))}
          />
          <time>{displayedView ? new Date(displayedView.run.timestamp).toLocaleTimeString("en-IN") : "—"}</time>
        </div>
      )}
      <p className="pm-twin-boundary">
        {connected
          ? "Observable operating data only · simulation ground truth is isolated from this twin."
          : "Illustrative 3D view · not connected to live or simulated plant telemetry."}
      </p>
    </section>
  );
}
