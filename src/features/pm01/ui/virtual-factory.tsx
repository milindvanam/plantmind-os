"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Box,
  ChevronRight,
  CircleGauge,
  Droplets,
  Factory,
  Flame,
  FlaskConical,
  Gauge,
  Maximize2,
  Minimize2,
  Minus,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  PackageCheck,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Truck,
  Warehouse,
  Wind,
  X,
  Zap
} from "lucide-react";
import type { Pm01AssetView, Pm01DisplayStatus } from "../contracts/visualization";
import type { Pm01SimulationSpeed } from "../contracts/simulation";
import { useFactorySimulation } from "../application/use-factory-simulation";
import { Plant3dView } from "./plant-3d-view";

const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
const percent = (value: number) => `${number(value * 100, 1)}%`;
const timestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date(value));

const STATUS_LABELS: Record<Pm01DisplayStatus, string> = {
  NORMAL: "Normal",
  WARNING: "Warning",
  CRITICAL: "Critical",
  OFFLINE: "Offline"
};

const PLANT_PROFILES = [
  {
    id: "chemical",
    label: "Chemical Industry",
    short: "Specialty chemicals",
    image: "/plant-views/chemical.png",
    flow: [
      "Tank farm",
      "Feed prep",
      "Reactor",
      "Separation",
      "Finishing",
      "Packaging",
      "Warehouse",
      "Dispatch"
    ],
    stats: [
      ["Throughput", "99.8 T/day"],
      ["OEE", "86.4%"],
      ["Energy intensity", "412 kWh-eq/T"]
    ]
  },
  {
    id: "msme",
    label: "MSME Manufacturing Plant",
    short: "Precision components",
    image: "/plant-views/msme-manufacturing.png",
    flow: [
      "Raw stores",
      "CNC cell",
      "Press shop",
      "Welding",
      "Inspection",
      "Assembly",
      "Finished goods",
      "Dispatch"
    ],
    stats: [
      ["Output", "1,248 units/day"],
      ["First-pass yield", "97.2%"],
      ["Machine utilization", "81.6%"]
    ]
  },
  {
    id: "clean-tech",
    label: "Clean-tech EPC & Bulk Handling",
    short: "Ducon-like equipment landscape",
    image: "/plant-views/clean-tech-epc.png",
    flow: [
      "Limestone intake",
      "Conveying",
      "Reagent prep",
      "FGD absorber",
      "Bag filter",
      "Ash silos",
      "Dewatering",
      "Rail loading"
    ],
    stats: [
      ["Gas treated", "2.4M Nm³/h"],
      ["SO₂ removal", "96.8%"],
      ["Bulk flow", "286 T/h"]
    ]
  },
  {
    id: "dairy",
    label: "Dairy Plant",
    short: "Milk processing & cold chain",
    image: "/plant-views/dairy.png",
    flow: [
      "Milk reception",
      "Chilling",
      "Separation",
      "Pasteurization",
      "Homogenization",
      "Filling",
      "Cold storage",
      "Dispatch"
    ],
    stats: [
      ["Milk processed", "420 KL/day"],
      ["Yield", "98.6%"],
      ["CIP compliance", "100%"]
    ]
  },
  {
    id: "sugar",
    label: "Sugar Factory",
    short: "Cane to crystal & energy",
    image: "/plant-views/sugar.png",
    flow: [
      "Cane yard",
      "Milling",
      "Clarification",
      "Evaporation",
      "Crystallization",
      "Centrifugals",
      "Bagging",
      "Cogeneration"
    ],
    stats: [
      ["Cane crush", "5,200 TCD"],
      ["Recovery", "11.4%"],
      ["Export power", "18.6 MW"]
    ]
  }
] as const;

function StatusMark({ status }: { status: Pm01DisplayStatus }) {
  return (
    <span className={`pm-status pm-status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>
  );
}

function SimulationControls({
  status,
  speed,
  onPlay,
  onPause,
  onReset,
  onSpeed
}: {
  status: string;
  speed: Pm01SimulationSpeed;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeed: (speed: Pm01SimulationSpeed) => void;
}) {
  return (
    <div className="pm-simulation-controls" aria-label="PM-01 simulation controls">
      <span className="pm-simulation-label">
        <Activity size={14} /> SIMULATION
      </span>
      <button onClick={onPlay} aria-pressed={status === "RUNNING"}>
        <Play size={14} /> Play
      </button>
      <button onClick={onPause} aria-pressed={status === "PAUSED"}>
        <Pause size={14} /> Pause
      </button>
      <button onClick={onReset}>
        <RotateCcw size={14} /> Reset
      </button>
      <div className="pm-speed-group" aria-label="Simulation speed">
        {([1, 10, 100, 1000] as const).map((item) => (
          <button
            key={item}
            className={speed === item ? "active" : ""}
            onClick={() => onSpeed(item)}
            aria-pressed={speed === item}
          >
            {item}×
          </button>
        ))}
      </div>
    </div>
  );
}

function KpiRail({ view }: { view: ReturnType<typeof useFactorySimulation>["view"] }) {
  const kpis = [
    ["Production today", number(view.kpis.productionTodayTonnes), "T"],
    ["Target achievement", percent(view.kpis.targetAchievement), ""],
    [
      "Projected EOD",
      view.kpis.projectedEndOfDayTonnes === null ? "—" : number(view.kpis.projectedEndOfDayTonnes),
      "T"
    ],
    ["Current rate", number(view.kpis.productionRateTonnesPerDay), "T/day"],
    ["OEE", percent(view.kpis.oee.oee), ""],
    [
      "Energy / tonne",
      view.kpis.energyPerTonne === null ? "—" : number(view.kpis.energyPerTonne),
      "kWh-eq/T"
    ]
  ] as const;
  return (
    <section className="pm-kpi-rail" aria-label="Factory overview">
      {kpis.map(([label, value, unit]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>
            {value}
            <small>{unit}</small>
          </strong>
        </div>
      ))}
    </section>
  );
}

function AnimatedPlantView({
  view,
  onAsset
}: {
  view: ReturnType<typeof useFactorySimulation>["view"];
  onAsset: (assetId: string) => void;
}) {
  const stages = [0, 2, 3, 4, 5, 6, 8, 9]
    .map((index) => view.processNodes[index])
    .filter((node): node is (typeof view.processNodes)[number] => Boolean(node));
  const machinery = [
    "tank",
    "feed",
    "reactor",
    "separator",
    "dryer",
    "packager",
    "warehouse",
    "dispatch"
  ];
  return (
    <section
      className={`pm-plant-visual ${view.run.status === "RUNNING" ? "is-running" : "is-paused"}`}
      aria-labelledby="animated-plant-title"
    >
      <header>
        <div>
          <span className="pm-section-kicker">Live visual layer · observable simulation data</span>
          <h2 id="animated-plant-title">ASC-100 manufacturing line</h2>
        </div>
        <div className="pm-visual-live-state">
          <span>
            <i /> {view.run.status}
          </span>
          <strong>{number(view.kpis.productionRateTonnesPerDay)} T/day</strong>
        </div>
      </header>
      <div className="pm-plant-scene">
        <div className="pm-scene-skyline" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="pm-scene-pipe" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="pm-machinery-line">
          {stages.map((node, index) => {
            const assetId = node.assetIds[0];
            return (
              <button
                key={node.id}
                className={`pm-machine pm-machine-${machinery[index]} ${node.active ? "active" : ""}`}
                onClick={() => assetId && onAsset(assetId)}
                disabled={!assetId}
                aria-label={`${node.title}, ${number(node.throughputTonnesPerHour, 2)} tonnes per hour`}
              >
                <span className="pm-machine-art" aria-hidden="true">
                  <i className="pm-machine-body" />
                  <i className="pm-machine-motion" />
                  <i className="pm-machine-signal" />
                </span>
                <span className="pm-machine-data">
                  <small>{node.title}</small>
                  <strong>
                    {number(node.throughputTonnesPerHour, 2)} <b>T/h</b>
                  </strong>
                  <em>{number(node.inventoryTonnes)} T held</em>
                </span>
              </button>
            );
          })}
        </div>
        <div className="pm-scene-utilities">
          {view.utilities.map((utility) => (
            <button key={utility.id} onClick={() => onAsset(utility.assetId)}>
              <span>{utility.label}</span>
              <strong>
                {number(utility.value)} <small>{utility.unit}</small>
              </strong>
            </button>
          ))}
        </div>
        <div className="pm-scene-summary">
          <span>
            Batch <strong>{view.batches[0]?.id ?? "—"}</strong>
          </span>
          <span>
            OEE <strong>{percent(view.kpis.oee.oee)}</strong>
          </span>
          <span>
            Energy{" "}
            <strong>
              {view.kpis.energyPerTonne === null ? "—" : number(view.kpis.energyPerTonne)} kWh-eq/T
            </strong>
          </span>
        </div>
      </div>
      <p className="pm-visual-boundary">
        Animated operating view derived only from observable process state. Select equipment to
        inspect its current tags.
      </p>
    </section>
  );
}

type PlantProfile = (typeof PLANT_PROFILES)[number];
type PlantScope = "overall" | "input" | "process" | "output";
type PlantViewMode = "process" | "model3d" | "machinery" | "data";

const SCOPE_LABELS: Record<PlantScope, string> = {
  overall: "Overall plant · A–Z",
  input: "Raw material · storage · QC",
  process: "Production process",
  output: "Finished goods · QC · waste"
};

const BY_PRODUCTS: Record<PlantProfile["id"], string> = {
  chemical: "Effluent & process losses",
  msme: "Scrap & rework",
  "clean-tech": "Gypsum & fly ash",
  dairy: "Cream, whey & effluent",
  sugar: "Bagasse, molasses & press mud"
};

const SCOPE_METRICS: Record<
  PlantProfile["id"],
  Record<PlantScope, readonly (readonly [string, string])[]>
> = {
  chemical: {
    overall: PLANT_PROFILES[0].stats,
    input: [
      ["Feed available", "296 T"],
      ["Incoming QC", "100%"],
      ["Tank utilization", "72%"]
    ],
    process: [
      ["Reactor load", "84%"],
      ["Process yield", "92.1%"],
      ["Energy", "412 kWh-eq/T"]
    ],
    output: [
      ["Packing rate", "5.0 T/h"],
      ["Final QC", "Released"],
      ["Losses", "1.8%"]
    ]
  },
  msme: {
    overall: PLANT_PROFILES[1].stats,
    input: [
      ["Material cover", "3.2 days"],
      ["Incoming QC", "98.8%"],
      ["Stores fill", "68%"]
    ],
    process: [
      ["Cycle time", "42 sec"],
      ["First-pass yield", "97.2%"],
      ["WIP", "386 units"]
    ],
    output: [
      ["Dispatch ready", "612 units"],
      ["Final QC", "99.1%"],
      ["Scrap", "2.1%"]
    ]
  },
  "clean-tech": {
    overall: PLANT_PROFILES[2].stats,
    input: [
      ["Limestone stock", "4,860 T"],
      ["Moisture QC", "6.2%"],
      ["Conveyor load", "74%"]
    ],
    process: [
      ["SO₂ removal", "96.8%"],
      ["Absorber load", "88%"],
      ["Gas flow", "2.4M Nm³/h"]
    ],
    output: [
      ["Gypsum", "18.4 T/h"],
      ["Fly ash", "42 T/h"],
      ["Rail loading", "286 T/h"]
    ]
  },
  dairy: {
    overall: PLANT_PROFILES[3].stats,
    input: [
      ["Milk receiving", "18 KL/h"],
      ["Incoming QC", "100%"],
      ["Chilled stock", "72%"]
    ],
    process: [
      ["Line rate", "17.5 KL/h"],
      ["Yield", "98.6%"],
      ["CIP compliance", "100%"]
    ],
    output: [
      ["Filling rate", "19,200 packs/h"],
      ["Final QC", "Released"],
      ["Whey recovery", "92%"]
    ]
  },
  sugar: {
    overall: PLANT_PROFILES[4].stats,
    input: [
      ["Cane yard", "8,400 T"],
      ["Pol QC", "13.2%"],
      ["Feed rate", "217 T/h"]
    ],
    process: [
      ["Crush rate", "5,200 TCD"],
      ["Recovery", "11.4%"],
      ["Steam balance", "Stable"]
    ],
    output: [
      ["Bagging", "24 T/h"],
      ["Sugar QC", "M-30"],
      ["Bagasse export", "18.6 MW"]
    ]
  }
};

function equipmentForScope(profile: PlantProfile, scope: PlantScope) {
  if (scope === "input") return [profile.flow[0], profile.flow[1], "Incoming quality control"];
  if (scope === "process") return profile.flow.slice(2, 6);
  if (scope === "output")
    return [profile.flow[6], "Final product QC", profile.flow[7], BY_PRODUCTS[profile.id]];
  return profile.flow;
}

function SectorProcessView({
  profile,
  running,
  scope
}: {
  profile: PlantProfile;
  running: boolean;
  scope: PlantScope;
}) {
  const equipment = equipmentForScope(profile, scope);
  return (
    <section
      className={`pm-sector-process pm-scope-${scope} ${running ? "is-running" : ""}`}
      aria-label={`${profile.label} ${SCOPE_LABELS[scope]} animated process map`}
    >
      <header>
        <div>
          <span className="pm-section-kicker">Animated operating map · {SCOPE_LABELS[scope]}</span>
          <h2>{profile.label}</h2>
          <p>{profile.short} · equipment-to-equipment operating context</p>
        </div>
        <span className="pm-sector-live">
          <i /> {running ? "LIVE" : "READY"}
        </span>
      </header>
      <div className="pm-sector-flow">
        {equipment.map((item, index) => (
          <div className="pm-sector-unit" key={item}>
            <span className="pm-sector-equipment">
              <i />
              <i />
              <i />
            </span>
            <strong>{item}</strong>
            <small>{index % 3 === 0 ? "Normal" : index % 3 === 1 ? "In service" : "Stable"}</small>
            {index < equipment.length - 1 && (
              <b aria-hidden="true">
                <i />
              </b>
            )}
          </div>
        ))}
      </div>
      {scope === "overall" && (
        <div className="pm-sector-support" aria-label="Plant-wide support systems">
          <span>
            <strong>Incoming QC</strong> Material release
          </span>
          <span>
            <strong>Utilities</strong> Power · steam · air · water
          </span>
          <span>
            <strong>Maintenance</strong> Workshop · spares
          </span>
          <span>
            <strong>Environment</strong> Effluent · waste · recovery
          </span>
          <span>
            <strong>Final QC</strong> Product release
          </span>
        </div>
      )}
      <div className="pm-sector-stat-strip">
        {profile.stats.map(([label, value]) => (
          <span key={label}>
            {label}
            <strong>{value}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

function MachineryView({ profile, scope }: { profile: PlantProfile; scope: PlantScope }) {
  const equipment = equipmentForScope(profile, scope);
  const initialPosition = {
    overall: { x: 50, y: 50 },
    input: { x: 18, y: 50 },
    process: { x: 52, y: 48 },
    output: { x: 86, y: 52 }
  }[scope];
  const [zoom, setZoom] = useState(scope === "overall" ? 1 : 1.35);
  const [pan, setPan] = useState(initialPosition);
  const [walkthrough, setWalkthrough] = useState(false);
  const move = (x: number, y: number) =>
    setPan((current) => ({
      x: Math.max(5, Math.min(95, current.x + x)),
      y: Math.max(10, Math.min(90, current.y + y))
    }));
  const resetCamera = () => {
    setZoom(scope === "overall" ? 1 : 1.35);
    setPan(initialPosition);
    setWalkthrough(false);
  };
  return (
    <section
      className={`pm-machinery-photo pm-photo-${scope} ${walkthrough ? "is-walkthrough" : ""}`}
      aria-label={`${profile.label} ${SCOPE_LABELS[scope]} machinery view`}
    >
      <Image
        src={profile.image}
        alt={`${profile.label} machinery and process equipment overview`}
        fill
        sizes="(max-width: 820px) 100vw, calc(100vw - 248px)"
        quality={75}
        style={{
          transform: `scale(${zoom * (walkthrough ? 1.42 : 1)})`,
          objectPosition: `${pan.x}% ${walkthrough ? Math.min(88, pan.y + 16) : pan.y}%`
        }}
      />
      <div className="pm-photo-shade" />
      <header>
        <span className="pm-section-kicker">Realistic machinery layer · {SCOPE_LABELS[scope]}</span>
        <h2>{profile.label}</h2>
        <p>Explore the physical equipment landscape with operating context overlaid.</p>
      </header>
      <div className="pm-map-controls" aria-label="Plant visual navigation controls">
        <button onClick={() => setZoom((value) => Math.min(3, value + 0.25))} aria-label="Zoom in">
          <Plus size={15} />
        </button>
        <strong>{Math.round(zoom * 100)}%</strong>
        <button onClick={() => setZoom((value) => Math.max(1, value - 0.25))} aria-label="Zoom out">
          <Minus size={15} />
        </button>
        <span className="pm-pan-pad">
          <button onClick={() => move(0, -10)} aria-label="Pan up">
            <MoveUp size={13} />
          </button>
          <button onClick={() => move(-10, 0)} aria-label="Pan left">
            <MoveLeft size={13} />
          </button>
          <button onClick={() => move(10, 0)} aria-label="Pan right">
            <MoveRight size={13} />
          </button>
          <button onClick={() => move(0, 10)} aria-label="Pan down">
            <MoveDown size={13} />
          </button>
        </span>
        <button onClick={resetCamera} aria-label="Reset plant view">
          <RotateCcw size={14} />
        </button>
        <button
          className={walkthrough ? "active" : ""}
          onClick={() => setWalkthrough((value) => !value)}
          aria-pressed={walkthrough}
        >
          <Factory size={14} /> {walkthrough ? "Exit walk-through" : "Walk-through view"}
        </button>
      </div>
      <div className="pm-photo-hotspots">
        {equipment.slice(0, 6).map((item, index) => (
          <button
            key={item}
            style={{
              left: `${12 + (index % 3) * 34}%`,
              top: `${32 + Math.floor(index / 3) * 34}%`
            }}
          >
            <i>{index + 1}</i>
            <span>
              {item}
              <small>Normal · observable</small>
            </span>
          </button>
        ))}
      </div>
      <footer>
        {SCOPE_METRICS[profile.id][scope].map(([label, value]) => (
          <span key={label}>
            {label}
            <strong>{value}</strong>
          </span>
        ))}
      </footer>
    </section>
  );
}

function SectorStatistics({ profile, scope }: { profile: PlantProfile; scope: PlantScope }) {
  const equipment = equipmentForScope(profile, scope);
  return (
    <section className="pm-sector-statistics" aria-label={`${profile.label} statistical view`}>
      <header>
        <span className="pm-section-kicker">Sector operating snapshot</span>
        <h2>{profile.label}</h2>
      </header>
      <div className="pm-sector-stat-cards">
        {profile.stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <i />
          </div>
        ))}
      </div>
      <div className="pm-sector-equipment-table">
        {equipment.map((item, index) => (
          <div key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
            <small>Operating normally</small>
            <b>{88 + (index % 5) * 2}%</b>
          </div>
        ))}
      </div>
      <p>
        Illustrative sector view. Detailed deterministic models will be activated per industry
        implementation.
      </p>
    </section>
  );
}

function ProductionTarget({ view }: { view: ReturnType<typeof useFactorySimulation>["view"] }) {
  const progress = Math.min(100, view.kpis.targetAchievement * 100);
  return (
    <section className="pm-production-target" aria-labelledby="production-target-title">
      <header>
        <div>
          <span className="pm-section-kicker">Today&apos;s production</span>
          <h2 id="production-target-title">Target versus actual</h2>
        </div>
        <strong>
          {number(view.kpis.productionTodayTonnes)}{" "}
          <small>/ {number(view.kpis.dailyTargetTonnes)} T</small>
        </strong>
      </header>
      <div className="pm-target-track">
        <span style={{ width: `${progress}%` }} />
      </div>
      <dl>
        <div>
          <dt>Expected by now</dt>
          <dd>{number(view.kpis.expectedByNowTonnes)} T</dd>
        </div>
        <div>
          <dt>Actual</dt>
          <dd>{number(view.kpis.productionTodayTonnes)} T</dd>
        </div>
        <div>
          <dt>Variance</dt>
          <dd className={view.kpis.productionVarianceTonnes < 0 ? "text-warning" : ""}>
            {view.kpis.productionVarianceTonnes >= 0 ? "+" : ""}
            {number(view.kpis.productionVarianceTonnes)} T
          </dd>
        </div>
        <div>
          <dt>Projected EOD</dt>
          <dd>
            {view.kpis.projectedEndOfDayTonnes === null
              ? "—"
              : `${number(view.kpis.projectedEndOfDayTonnes)} T`}
          </dd>
        </div>
        <div>
          <dt>Capacity utilization</dt>
          <dd>{percent(view.kpis.capacityUtilization)}</dd>
        </div>
      </dl>
    </section>
  );
}

function ProcessMap({
  view,
  onAsset
}: {
  view: ReturnType<typeof useFactorySimulation>["view"];
  onAsset: (assetId: string) => void;
}) {
  const icons = [
    Warehouse,
    Droplets,
    FlaskConical,
    Flame,
    CircleGauge,
    Factory,
    PackageCheck,
    Box,
    Warehouse,
    Truck
  ];
  return (
    <section
      className={`pm-process-map ${view.run.status === "RUNNING" ? "is-running" : "is-paused"}`}
      aria-labelledby="process-map-title"
    >
      <header>
        <div>
          <span className="pm-section-kicker">Physical process topology</span>
          <h2 id="process-map-title">Raw materials to dispatch</h2>
        </div>
        <span className="pm-map-legend">
          <i /> Material moving from current simulation state
        </span>
      </header>
      <div className="pm-process-scroll">
        <div className="pm-process-flow">
          {view.processNodes.map((node, index) => {
            const Icon = icons[index] ?? Factory;
            const primaryAssetId = node.assetIds[0];
            return (
              <div className="pm-flow-unit" key={node.id}>
                <button
                  className={`pm-process-node ${node.active ? "active" : ""}`}
                  onClick={() => primaryAssetId && onAsset(primaryAssetId)}
                  disabled={!primaryAssetId}
                  aria-label={`${node.title}: ${node.subtitle}`}
                >
                  <span className="pm-node-top">
                    <Icon size={18} />
                    <StatusMark status={node.status} />
                  </span>
                  <strong>{node.title}</strong>
                  <small>{node.subtitle}</small>
                  <span className="pm-node-reading">
                    <b>{number(node.inventoryTonnes)}</b> T held
                  </span>
                  <span className="pm-node-rate">
                    {number(node.throughputTonnesPerHour, 2)} T/h
                  </span>
                </button>
                {index < view.processNodes.length - 1 && (
                  <div
                    className={`pm-flow-connector ${node.active ? "active" : ""}`}
                    aria-hidden="true"
                  >
                    <span />
                    <ChevronRight size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pm-reaction-loop">
        <span>Reaction thermal loop</span>
        {(
          [
            ["HX-301", "Heat exchanger"],
            ["CV-301", "Cooling valve"],
            ["P-301A", "Circulation A"],
            ["P-301B", "Standby B"]
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => onAsset(id)}>
            <Gauge size={14} />
            <strong>{id}</strong>
            <small>{label}</small>
          </button>
        ))}
      </div>
      <div className="pm-utility-bus">
        <span>Utility bus</span>
        {view.utilities.map((utility) => {
          const Icon =
            utility.id === "electricity"
              ? Zap
              : utility.id === "steam"
                ? Flame
                : utility.id === "cooling"
                  ? Droplets
                  : Wind;
          return (
            <button key={utility.id} onClick={() => onAsset(utility.assetId)}>
              <Icon size={15} />
              <span>
                <strong>{utility.label}</strong>
                <small>
                  {number(utility.value)} {utility.unit}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InventoryPanel({ view }: { view: ReturnType<typeof useFactorySimulation>["view"] }) {
  return (
    <section className="pm-compact-panel">
      <header>
        <span className="pm-section-kicker">Materials</span>
        <h2>Raw inventory</h2>
      </header>
      <div className="pm-inventory-list">
        {view.inventories.map((item) => (
          <div key={item.materialId}>
            <div>
              <strong>{item.materialId}</strong>
              <span>{item.label}</span>
              <b>{number(item.tonnes)} T</b>
            </div>
            <div className="pm-inventory-track">
              <span style={{ width: `${Math.min(100, item.utilization * 100)}%` }} />
            </div>
            <small>{percent(item.utilization)} of modeled capacity</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function BatchPanel({ view }: { view: ReturnType<typeof useFactorySimulation>["view"] }) {
  const active = view.batches.find((batch) => batch.state === "ACTIVE") ?? view.batches[0];
  if (!active) return null;
  return (
    <section className="pm-compact-panel pm-batch-panel">
      <header>
        <span className="pm-section-kicker">Production campaign</span>
        <h2>Active batch</h2>
        <span className="pm-batch-state">{active.state}</span>
      </header>
      <div className="pm-batch-identity">
        <div>
          <strong>{active.id}</strong>
          <span>{active.product}</span>
        </div>
        <b>
          {number(active.actualQuantityTonnes)}{" "}
          <small>/ {number(active.plannedQuantityTonnes)} T</small>
        </b>
      </div>
      <div className="pm-batch-progress">
        <span
          style={{
            width: `${Math.min(100, (active.actualQuantityTonnes / active.plannedQuantityTonnes) * 100)}%`
          }}
        />
      </div>
      <dl>
        <div>
          <dt>Started</dt>
          <dd>{timestamp(active.startedAt)}</dd>
        </div>
        <div>
          <dt>Expected</dt>
          <dd>{timestamp(active.expectedCompletionAt)}</dd>
        </div>
        <div>
          <dt>Yield</dt>
          <dd>{active.yield === null ? "—" : percent(active.yield)}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{active.qualityState}</dd>
        </div>
      </dl>
      <details>
        <summary>Raw-material lots</summary>
        {active.rawMaterialLots.map((lot) => (
          <div className="pm-lot-row" key={lot.materialId}>
            <span>{lot.materialId}</span>
            <code>{lot.lotId}</code>
            <b>{number(lot.consumedTonnes, 3)} T</b>
          </div>
        ))}
      </details>
      {view.batches.length > 1 && (
        <div className="pm-recent-batches">
          <span>Recent</span>
          {view.batches.slice(1).map((batch) => (
            <div key={batch.id}>
              <strong>{batch.id}</strong>
              <span>
                {number(batch.actualQuantityTonnes)} T · {batch.qualityState}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OeePanel({ view }: { view: ReturnType<typeof useFactorySimulation>["view"] }) {
  return (
    <section className="pm-compact-panel">
      <header>
        <span className="pm-section-kicker">Effectiveness</span>
        <h2>OEE decomposition</h2>
      </header>
      <div
        className="pm-oee-ring"
        style={
          { "--oee": `${Math.min(100, view.kpis.oee.oee * 100) * 3.6}deg` } as React.CSSProperties
        }
      >
        <strong>{percent(view.kpis.oee.oee)}</strong>
        <span>OEE</span>
      </div>
      <dl className="pm-oee-components">
        <div>
          <dt>Availability</dt>
          <dd>{percent(view.kpis.oee.availability)}</dd>
        </div>
        <div>
          <dt>Performance</dt>
          <dd>{percent(view.kpis.oee.performance)}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{percent(view.kpis.oee.quality)}</dd>
        </div>
      </dl>
    </section>
  );
}

function IntelligencePlaceholder() {
  return (
    <section className="pm-intelligence-placeholder">
      <Sparkles size={18} />
      <div>
        <span className="pm-section-kicker">PlantMind Intelligence</span>
        <h2>Intelligence layer not active</h2>
        <p>
          This simulation milestone exposes operating context only. No AI insights, anomaly
          detection or recommendations are being generated.
        </p>
      </div>
    </section>
  );
}

function Range({
  label,
  value
}: {
  label: string;
  value: { minimum: number; maximum: number } | null;
}) {
  return value ? (
    <span>
      {label} {number(value.minimum)}–{number(value.maximum)}
    </span>
  ) : null;
}

function AssetDrawer({ asset, onClose }: { asset: Pm01AssetView | null; onClose: () => void }) {
  if (!asset) return null;
  return (
    <div className="pm-asset-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="pm-asset-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-asset-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className="pm-section-kicker">
              {asset.areaCode} · {asset.areaName}
            </span>
            <h2 id="pm-asset-title">
              {asset.id} · {asset.name}
            </h2>
          </div>
          <button aria-label="Close asset details" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="pm-asset-summary">
          <StatusMark status={asset.status} />
          <span>{asset.operationalState}</span>
          <span>{asset.type.replaceAll("-", " ")}</span>
        </div>
        <dl className="pm-asset-design">
          <div>
            <dt>Rated capacity</dt>
            <dd>
              {asset.ratedCapacity
                ? `${asset.ratedCapacity.value} ${asset.ratedCapacity.unit}`
                : "Not specified"}
            </dd>
          </div>
          {Object.entries(asset.designParameters).map(([key, value]) => (
            <div key={key}>
              <dt>{key.replaceAll("-", " ")}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
        <section>
          <span className="pm-section-kicker">Observable measurements</span>
          <h3>Current tags</h3>
          <div className="pm-tag-list">
            {asset.tags.length === 0 ? (
              <p>No observable tags are configured for this asset in v0.1.</p>
            ) : (
              asset.tags.map((tag) => (
                <div key={tag.id}>
                  <header>
                    <span>{tag.name}</span>
                    <small>{tag.quality}</small>
                  </header>
                  <strong>
                    {typeof tag.value === "number" ? number(tag.value, 2) : String(tag.value)}{" "}
                    <small>{tag.engineeringUnit}</small>
                  </strong>
                  <footer>
                    <Range label="Normal" value={tag.normalRange} />
                    <Range label="Warning" value={tag.warningRange} />
                    <Range label="Alarm" value={tag.alarmRange} />
                  </footer>
                </div>
              ))
            )}
          </div>
        </section>
        <p className="pm-boundary-note">
          Observable operating data only. Simulator ground truth is not available in this view.
        </p>
      </aside>
    </div>
  );
}

export function VirtualFactory() {
  const simulation = useFactorySimulation();
  const [sectorId, setSectorId] = useState<(typeof PLANT_PROFILES)[number]["id"]>("chemical");
  const [viewMode, setViewMode] = useState<PlantViewMode>("process");
  const [scope, setScope] = useState<PlantScope>("overall");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const visualStageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await visualStageRef.current?.requestFullscreen();
  };
  const selectedAsset = useMemo(
    () => simulation.view.assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [simulation.view.assets, selectedAssetId]
  );
  const activeProfile =
    PLANT_PROFILES.find((profile) => profile.id === sectorId) ?? PLANT_PROFILES[0];
  const activeEquipment = useMemo(
    () => equipmentForScope(activeProfile, scope),
    [activeProfile, scope]
  );
  return (
    <div className="pm-factory-page">
      <header className="pm-factory-header">
        <div className="pm-factory-meta-row">
          <div className="pm-title-line">
            <span className="pm-live-mark">
              <Factory size={15} /> PM-01
            </span>
            <span>Apex Specialty Chemicals Ltd.</span>
          </div>
          <div className="pm-clock">
            <span>Simulation date / time</span>
            <strong>{timestamp(simulation.view.run.timestamp)}</strong>
            <small>
              Day {simulation.view.run.productionDay} · Shift {simulation.view.run.shift} ·{" "}
              {simulation.view.run.status}
            </small>
          </div>
        </div>
        <div className="pm-factory-command-row">
          <div className="pm-factory-heading">
            <h1>Virtual Factory</h1>
            <p>Industrial landscape · process · machinery · operating data</p>
          </div>
          <div className="pm-virtual-toolbar">
            <label className="pm-industry-select">
              <span>Industry</span>
              <select
                aria-label="Choose plant industry"
                value={sectorId}
                onChange={(event) => {
                  setSectorId(event.target.value as PlantProfile["id"]);
                  setViewMode("process");
                  setScope("overall");
                }}
              >
                {PLANT_PROFILES.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label} — {profile.short}
                  </option>
                ))}
              </select>
            </label>
            <label className="pm-industry-select pm-view-select">
              <span>View</span>
              <select
                aria-label="Choose plant view"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as PlantViewMode)}
              >
                <option value="process">Diagrammatic process</option>
                <option value="model3d">Actual plant · interactive 3D</option>
                <option value="machinery">Site imagery</option>
                <option value="data">Statistical view</option>
              </select>
            </label>
            <label className="pm-industry-select pm-section-select">
              <span>Plant section</span>
              <select
                aria-label="Choose plant section"
                value={scope}
                onChange={(event) => setScope(event.target.value as PlantScope)}
              >
                {(Object.entries(SCOPE_LABELS) as [PlantScope, string][]).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <SimulationControls
              status={simulation.view.run.status}
              speed={simulation.view.run.speed}
              onPlay={simulation.play}
              onPause={simulation.pause}
              onReset={simulation.reset}
              onSpeed={simulation.setSpeed}
            />
          </div>
        </div>
      </header>
      <div className="pm-visual-stage" ref={visualStageRef}>
        <button
          className="pm-fullscreen-button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit full screen" : "View plant visual full screen"}
          title={isFullscreen ? "Exit full screen (Esc)" : "View full screen"}
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          <span>{isFullscreen ? "Exit full screen" : "Full screen"}</span>
        </button>
        {viewMode === "process" ? (
          sectorId === "chemical" && scope === "overall" ? (
            <AnimatedPlantView view={simulation.view} onAsset={setSelectedAssetId} />
          ) : (
            <SectorProcessView
              profile={activeProfile}
              running={simulation.view.run.status === "RUNNING"}
              scope={scope}
            />
          )
        ) : viewMode === "model3d" ? (
          <Plant3dView
            industry={activeProfile.label}
            section={SCOPE_LABELS[scope]}
            equipment={activeEquipment}
            metrics={SCOPE_METRICS[activeProfile.id][scope]}
          />
        ) : viewMode === "machinery" ? (
          <MachineryView
            key={`${activeProfile.id}-${scope}`}
            profile={activeProfile}
            scope={scope}
          />
        ) : sectorId === "chemical" && scope === "overall" ? (
          <>
            <KpiRail view={simulation.view} />
            <ProductionTarget view={simulation.view} />
            <ProcessMap view={simulation.view} onAsset={setSelectedAssetId} />
            <div className="pm-lower-grid">
              <InventoryPanel view={simulation.view} />
              <BatchPanel view={simulation.view} />
              <OeePanel view={simulation.view} />
            </div>
            <IntelligencePlaceholder />
          </>
        ) : (
          <SectorStatistics profile={activeProfile} scope={scope} />
        )}
      </div>
      <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAssetId(null)} />
    </div>
  );
}
