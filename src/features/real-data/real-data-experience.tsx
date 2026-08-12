"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Database,
  Gauge,
  Pause,
  Play,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { Badge, Button, Card, Panel, SectionHeader, StatusIndicator } from "@/components/ui";
import type { DatasetManifest, HealthAssessment, HydraulicCycle } from "./canonical-telemetry";

type ReplayItem = {
  stage: "healthy" | "emerging" | "weak" | "severe";
  cycle: HydraulicCycle;
  assessment: HealthAssessment;
};
type Props = { manifest: Omit<DatasetManifest, "cycles">; replay: ReplayItem[] };
const stageLabels = {
  healthy: "Healthy operation",
  emerging: "Emerging deviation",
  weak: "Weak leakage",
  severe: "Severe condition"
};

export function RealDataBadge() {
  return (
    <Badge tone="real">
      <Database size={13} />
      REAL INDUSTRIAL DATA
    </Badge>
  );
}

export function RealDataExperience({ manifest, replay }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        setIndex((current) => {
          if (current >= replay.length - 1) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        }),
      2400
    );
    return () => window.clearInterval(timer);
  }, [playing, replay.length]);
  const selected = replay[index]!;
  const { cycle, assessment } = selected;
  const snapshot = useMemo(
    () => ({
      title:
        assessment.state === "healthy"
          ? "P-204A is within the healthy reference state"
          : "P-204A requires attention",
      summary:
        assessment.state === "healthy"
          ? "This UCI cycle is labelled stable with no internal pump leakage."
          : `Pump condition has deteriorated relative to stable, no-leakage cycles. The source label records ${assessment.leakage === 2 ? "severe" : "weak"} internal leakage.`
    }),
    [assessment]
  );
  return (
    <div className="page-stack real-data-experience">
      <section className="real-data-hero">
        <div>
          <div className="trust-row">
            <RealDataBadge />
            <Badge tone="simulated">SIMULATED ASSET CONTEXT</Badge>
          </div>
          <span className="eyebrow">Equipment health · P-204A Hydraulic Pump</span>
          <h1>{snapshot.title}</h1>
          <p>{snapshot.summary}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#evidence">
              Review evidence <ArrowRight size={15} />
            </Link>
            <Link className="button button-secondary" href="/real-data">
              Back to Real Data Lab
            </Link>
          </div>
        </div>
        <aside>
          <span>Health state</span>
          <StatusIndicator label={assessment.label} tone={assessment.state} />
          <span>UCI operating cycle</span>
          <strong>#{cycle.cycle}</strong>
          <span>Source confidence</span>
          <strong>{assessment.confidence}%</strong>
        </aside>
      </section>
      <Panel className="real-replay">
        <SectionHeader
          title="Actual-cycle replay"
          detail="Each step selects an unchanged, labelled 60-second UCI operating cycle"
        />
        <div className="real-replay-controls">
          <Button onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
            {playing ? "Pause" : "Play real-data replay"}
          </Button>
          {replay.map((item, itemIndex) => (
            <button
              key={item.stage}
              className={index === itemIndex ? "active" : ""}
              onClick={() => {
                setIndex(itemIndex);
                setPlaying(false);
              }}
            >
              <span>{itemIndex + 1}</span>
              <strong>{stageLabels[item.stage]}</strong>
              <small>Cycle #{item.cycle.cycle}</small>
            </button>
          ))}
        </div>
      </Panel>
      <section>
        <SectionHeader
          title="What PlantMind sees"
          detail="Selected executive signals; full cycle statistics remain available as evidence"
        />
        <div className="real-signal-grid">
          {assessment.supportingSignals.slice(0, 4).map((signal) => (
            <Card key={signal.sensorId} className="real-signal-card">
              <div>
                <Gauge size={17} />
                <span>{signal.label}</span>
              </div>
              <strong>
                {signal.value.toLocaleString()} <small>{signal.unit}</small>
              </strong>
              <p>
                Healthy baseline {signal.baseline.toLocaleString()} {signal.unit}
              </p>
              <span
                className={
                  Math.abs(signal.deviationPercent) > 5
                    ? "signal-deviation notable"
                    : "signal-deviation"
                }
              >
                {signal.deviationPercent > 0 ? "+" : ""}
                {signal.deviationPercent}% vs baseline
              </span>
            </Card>
          ))}
        </div>
      </section>
      <div className="split-grid wide-left" id="evidence">
        <Panel>
          <SectionHeader
            title="Why PlantMind reached this condition"
            detail="Deterministic interpretation · not a certified diagnostic model"
          />
          <div className="real-conclusion">
            <Activity />
            <div>
              <StatusIndicator label={assessment.label} tone={assessment.state} />
              <h2>
                Pump leakage label: {assessment.leakage} ·{" "}
                {assessment.leakage === 0
                  ? "No leakage"
                  : assessment.leakage === 1
                    ? "Weak leakage"
                    : "Severe leakage"}
              </h2>
              <p>{assessment.reason}</p>
            </div>
          </div>
          <div className="evidence-table">
            <div className="evidence-row head">
              <span>Sensor</span>
              <span>Measured mean</span>
              <span>Healthy baseline</span>
              <span>Deviation</span>
            </div>
            {assessment.supportingSignals.map((signal) => (
              <div className="evidence-row" key={signal.sensorId}>
                <span>
                  <strong>{signal.sensorId}</strong>
                  {signal.label}
                </span>
                <span>
                  {signal.value} {signal.unit}
                </span>
                <span>
                  {signal.baseline} {signal.unit}
                </span>
                <span>
                  {signal.deviationPercent > 0 ? "+" : ""}
                  {signal.deviationPercent}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionHeader
            title="Recommended action"
            detail="PlantMind recommendation · human engineering review required"
          />
          <div className="recommendation-compact">
            <Wrench />
            <p>
              {assessment.state === "healthy"
                ? "Continue condition monitoring and retain this cycle in the healthy comparison set."
                : "Maintenance should inspect P-204A for internal leakage and verify pump efficiency, seals and associated hydraulic conditions."}
            </p>
          </div>
          <div className="truth-list">
            <RealDataBadge />
            <Badge tone="ai">PLANTMIND RECOMMENDATION</Badge>
            <Badge tone="audit">
              <ShieldCheck size={13} />
              Evidence linked
            </Badge>
          </div>
          <p className="real-boundary">
            This recommendation contextualises public experimental telemetry. It is not a verified
            engineering diagnosis and does not authorize equipment intervention.
          </p>
        </Panel>
      </div>
      <Panel className="provenance-panel">
        <SectionHeader
          title="Dataset provenance"
          detail="Source telemetry and PlantMind demonstration context are kept separate"
        />
        <dl>
          <div>
            <dt>Dataset</dt>
            <dd>{manifest.source.title}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{manifest.source.provider}</dd>
          </div>
          <div>
            <dt>Data type</dt>
            <dd>{manifest.source.dataType}</dd>
          </div>
          <div>
            <dt>Operating cycles</dt>
            <dd>{manifest.source.operatingCycles.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd>{manifest.source.license}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>Cycle #{cycle.cycle} · 60 seconds</dd>
          </div>
        </dl>
        <div className="provenance-disclosure">
          <ShieldCheck />
          <p>
            <strong>Context disclosure:</strong> Asset identity, plant identity, Maharashtra
            location and business context are simulated by PlantMind for demonstration. Operational
            telemetry and pump-condition labels originate from the cited public UCI dataset.
          </p>
        </div>
      </Panel>
    </div>
  );
}
