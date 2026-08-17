"use client";

import { useMemo, useState } from "react";
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
  PackageCheck,
  Pause,
  Play,
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
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const selectedAsset = useMemo(
    () => simulation.view.assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [simulation.view.assets, selectedAssetId]
  );
  return (
    <div className="pm-factory-page">
      <header className="pm-factory-header">
        <div>
          <div className="pm-title-line">
            <span className="pm-live-mark">
              <Factory size={15} /> PM-01
            </span>
            <span>Apex Specialty Chemicals Ltd.</span>
          </div>
          <h1>Virtual Factory</h1>
          <p>Deterministic ASC-100 production · complete material flow · simulation data</p>
        </div>
        <div className="pm-clock">
          <span>Simulation date / time</span>
          <strong>{timestamp(simulation.view.run.timestamp)}</strong>
          <small>
            Day {simulation.view.run.productionDay} · Shift {simulation.view.run.shift} ·{" "}
            {simulation.view.run.status}
          </small>
        </div>
      </header>
      <SimulationControls
        status={simulation.view.run.status}
        speed={simulation.view.run.speed}
        onPlay={simulation.play}
        onPause={simulation.pause}
        onReset={simulation.reset}
        onSpeed={simulation.setSpeed}
      />
      <KpiRail view={simulation.view} />
      <ProductionTarget view={simulation.view} />
      <ProcessMap view={simulation.view} onAsset={setSelectedAssetId} />
      <div className="pm-lower-grid">
        <InventoryPanel view={simulation.view} />
        <BatchPanel view={simulation.view} />
        <OeePanel view={simulation.view} />
      </div>
      <IntelligencePlaceholder />
      <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAssetId(null)} />
    </div>
  );
}
