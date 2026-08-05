"use client";

import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Boxes,
  CircleDashed,
  Database,
  Factory,
  ShieldCheck,
  Wrench
} from "lucide-react";
import {
  Alert,
  AuditStatusLabel,
  Badge,
  Breadcrumb,
  Button,
  EmptyState,
  EvidenceIndicator,
  KpiCard,
  PageHeader,
  Panel,
  SectionHeader,
  SimulatedDataLabel,
  StatusIndicator,
  TableShell,
  Tabs
} from "@/components/ui";
import { ExecutiveDashboard } from "@/features/command/executive-dashboard";
import { useScenario } from "@/features/scenario/scenario-provider";
import { sampleAt } from "@/lib/scenario";

type Kind = "command" | "operations" | "asset" | "investigation" | "executives" | "intervention";

const configs = {
  command: {
    eyebrow: "Executive command centre",
    title: "Operational priorities",
    description: "A calm, decision-first view of the current replayed plant state.",
    crumbs: ["PlantMind", "Executive Command"]
  },
  operations: {
    eyebrow: "Plant operations",
    title: "Reactor Line 2",
    description: "Production context and the position of P-204A within the simulated process path.",
    crumbs: ["PlantMind", "Plant Operations"]
  },
  asset: {
    eyebrow: "Asset intelligence",
    title: "Cooling Water Pump P-204A",
    description:
      "Engineering context, current replay values and the evidence surfaces planned for the vertical journey.",
    crumbs: ["PlantMind", "Assets", "P-204A"]
  },
  investigation: {
    eyebrow: "Copilot investigation",
    title: "INV-204 · Pump degradation",
    description:
      "The governed investigation workspace foundation. AI analysis is intentionally not implemented in Sprint 1.",
    crumbs: ["PlantMind", "Investigations", "INV-204"]
  },
  executives: {
    eyebrow: "Executive briefs",
    title: "Decision perspectives",
    description:
      "Two distinct executive brief structures prepared for evidence-backed content in a later sprint.",
    crumbs: ["PlantMind", "Executive Briefs", "INV-204"]
  },
  intervention: {
    eyebrow: "Approval & outcome",
    title: "ACT-204 · Controlled inspection",
    description:
      "A read-only foundation for the future governed approval and simulated work-order journey.",
    crumbs: ["PlantMind", "Interventions", "ACT-204"]
  }
} as const;

export function PrototypePage({ kind }: { kind: Kind }) {
  const config = configs[kind];
  const { state, stage, timestamp } = useScenario();
  const sample = sampleAt(state.elapsedMinutes);
  return (
    <>
      <Breadcrumb items={[...config.crumbs]} />
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={
          <div className="trust-row">
            <SimulatedDataLabel />
            <AuditStatusLabel status="Replay traceable" />
          </div>
        }
      />
      <Alert
        title={kind === "command" ? "Sprint 2 · Executive Dashboard" : "Sprint 1 foundation"}
        tone="info"
      >
        {kind === "command"
          ? "This milestone composes governed replay truth into the executive decision hierarchy. Dependent engines remain explicitly unavailable."
          : "This route validates the shared shell, replay state and intended information hierarchy. Later-sprint intelligence and workflows are clearly withheld."}
      </Alert>
      {kind === "command" && <ExecutiveDashboard />}
      {kind === "operations" && <Operations stage={stage} sample={sample} />}
      {kind === "asset" && <Asset stage={stage} timestamp={timestamp} sample={sample} />}
      {kind === "investigation" && <Investigation />}
      {kind === "executives" && <Executives />}
      {kind === "intervention" && <Intervention />}
    </>
  );
}

type LiveProps = {
  stage: ReturnType<typeof import("@/lib/scenario").getStageAt>;
  sample: ReturnType<typeof sampleAt>;
  timestamp?: string;
};

function Operations({ stage, sample }: LiveProps) {
  return (
    <div className="page-stack">
      <div className="kpi-grid">
        <KpiCard
          label="Operating mode"
          value="Batch 24-071"
          detail="Deterministic scenario context"
        />
        <KpiCard
          label="Production rate"
          value={sample.throughput}
          unit="% plan"
          detail="Simulated operating metric"
        />
        <KpiCard label="Energy load" value={sample.power} unit="kW" detail="Replayed pump value" />
        <KpiCard
          label="Area state"
          value={stage.shortLabel}
          detail="Derived only from scenario stage"
          tone={stage.state}
        />
      </div>
      <div className="split-grid">
        <Panel>
          <SectionHeader
            title="Cooling-water process path"
            detail="Simplified context, not a digital twin"
          />
          <div className="process-path">
            <ProcessNode title="CW-201" detail="Cooling basin" />
            <span>→</span>
            <ProcessNode title="P-204A" detail="Affected pump" active />
            <span>→</span>
            <ProcessNode title="HX-208" detail="Reactor exchanger" />
            <span>→</span>
            <ProcessNode title="RL-2" detail="Reactor line" />
          </div>
          <Alert title="Topology is contextual" tone="info">
            The diagram is a static process relationship. Live control and digital-twin
            functionality are out of scope.
          </Alert>
        </Panel>
        <Panel>
          <SectionHeader title="Operating context" detail="Replayed source records" />
          <TableShell
            headers={["Record", "Value", "Provenance"]}
            rows={[
              ["Batch plan", "24-071 · controlled run", <SimulatedDataLabel key="a" />],
              ["Cooling demand", "High process demand", <SimulatedDataLabel key="b" />],
              ["Maintenance window", "18 Mar · 02:00 UTC", <SimulatedDataLabel key="c" />]
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

function Asset({ stage, sample, timestamp }: LiveProps) {
  const sensors = [
    ["Vibration", sample.vibration, "mm/s RMS"],
    ["Temperature", sample.temperature, "°C"],
    ["Pressure", sample.pressure, "bar"],
    ["Flow", sample.flow, "m³/h"],
    ["Power", sample.power, "kW"]
  ] as const;
  return (
    <div className="page-stack">
      <section className="asset-banner">
        <div className="asset-icon">
          <Activity />
        </div>
        <div>
          <span className="eyebrow">Centrifugal pump · Cooling water</span>
          <h2>P-204A</h2>
          <p>Area RL-2 · Asset type CP-80/4 · Serial SIM-P204A</p>
        </div>
        <div className="asset-state">
          <StatusIndicator label={stage.label} tone={stage.state} />
          <span>As of {timestamp}</span>
        </div>
      </section>
      <div className="split-grid wide-left">
        <Panel>
          <SectionHeader
            title="Replayed sensor snapshot"
            detail="Values update from the deterministic scenario clock"
          />
          <div className="sensor-list">
            {sensors.map(([name, value, unit]) => (
              <div key={name}>
                <span>{name}</span>
                <strong>
                  {value} <small>{unit}</small>
                </strong>
                <div className="sparkline" aria-label={`${name} illustrative trend`}>
                  <span style={{ width: `${Math.min(95, 25 + Number(value) / 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionHeader title="Evidence foundation" detail="No anomaly conclusion in Sprint 1" />
          <div className="trust-list">
            <EvidenceIndicator status="5 replay signals" />
            <Badge tone="evidence">
              <Database size={13} />2 maintenance records
            </Badge>
            <AuditStatusLabel status="Timestamps retained" />
          </div>
          <Alert title="Analysis deferred" tone="warning">
            Threshold evaluation, anomaly detection and root-cause hypotheses are reserved for later
            approved sprints.
          </Alert>
        </Panel>
      </div>
    </div>
  );
}

function Investigation() {
  return (
    <div className="split-grid wide-left">
      <Panel>
        <SectionHeader
          title="Investigation workspace"
          detail="Planned bounded question categories"
        />
        <Tabs items={["Evidence", "Findings", "Impact"]} active="Evidence" />
        <div className="placeholder-stack">
          <Placeholder
            icon={Database}
            title="Observed facts"
            text="Will display cited sensor and maintenance records without model-authored measurements."
          />
          <Placeholder
            icon={BookOpenCheck}
            title="Evidence quality"
            text="Will expose supporting, contradicting and missing evidence."
          />
          <Placeholder
            icon={ShieldCheck}
            title="Governed synthesis"
            text="AI responses, tool access and citation validation are explicitly deferred."
          />
        </div>
      </Panel>
      <Panel>
        <SectionHeader title="Copilot boundary" detail="Not a general-purpose chatbot" />
        <EmptyState
          title="Copilot not enabled"
          description="Sprint 1 establishes the route and safe empty state only. No model, prompt, tool or generated answer is present."
        />
        <div className="planned-actions">
          <Badge tone="neutral">Condition</Badge>
          <Badge tone="neutral">Comparison</Badge>
          <Badge tone="neutral">Cause</Badge>
          <Badge tone="neutral">Context</Badge>
          <Badge tone="neutral">Impact</Badge>
          <Badge tone="neutral">Action</Badge>
        </div>
      </Panel>
    </div>
  );
}

function Executives() {
  return (
    <div className="page-stack">
      <Alert title="Briefs are not chat personas" tone="info">
        These foundations reserve distinct decision mandates and output structures. No AI-generated
        content is displayed.
      </Alert>
      <div className="split-grid">
        <Panel>
          <SectionHeader title="AI Maintenance Head" detail="Reliability mandate · future sprint" />
          <div className="mandate-icon">
            <Wrench />
          </div>
          <ul className="structured-list">
            <li>Asset-condition facts and evidence gaps</li>
            <li>Ranked hypotheses with contradictions</li>
            <li>Inspection scope and safety prerequisites</li>
            <li>No approval or submission authority</li>
          </ul>
          <Badge tone="neutral">Content unavailable · not generated</Badge>
        </Panel>
        <Panel>
          <SectionHeader title="AI Operations Head" detail="Continuity mandate · future sprint" />
          <div className="mandate-icon">
            <Factory />
          </div>
          <ul className="structured-list">
            <li>Production continuity and operating context</li>
            <li>Options, constraints and schedule trade-offs</li>
            <li>Decision window and accountable owner</li>
            <li>No production control or approval authority</li>
          </ul>
          <Badge tone="neutral">Content unavailable · not generated</Badge>
        </Panel>
      </div>
      <Panel>
        <SectionHeader
          title="Shared evidence, different mandates"
          detail="Structural differentiation reserved by design"
        />
        <div className="comparison-row">
          <EvidenceIndicator status="Same governed facts" />
          <ArrowRight />
          <Badge tone="ai">Different KPI order</Badge>
          <ArrowRight />
          <Badge tone="ai">Different decision schema</Badge>
        </div>
      </Panel>
    </div>
  );
}

function Intervention() {
  return (
    <div className="split-grid wide-left">
      <Panel>
        <SectionHeader
          title="Proposed controlled inspection"
          detail="Read-only proposal shell · version 0"
        />
        <div className="proposal-grid">
          <div>
            <span>Asset</span>
            <strong>P-204A</strong>
          </div>
          <div>
            <span>Work type</span>
            <strong>Inspection placeholder</strong>
          </div>
          <div>
            <span>Requested window</span>
            <strong>Not yet proposed</strong>
          </div>
          <div>
            <span>Approval state</span>
            <strong>Not available in Sprint 1</strong>
          </div>
        </div>
        <Alert title="Human approval required" tone="warning">
          Future recommendations remain drafts until a named authorized person approves the exact
          version. This Sprint has no mutation controls.
        </Alert>
        <div className="hero-actions">
          <Button disabled>Approve proposal</Button>
          <Button disabled variant="secondary">
            Request revision
          </Button>
        </div>
      </Panel>
      <Panel>
        <SectionHeader
          title="Governance foundation"
          detail="Capabilities prepared, not implemented"
        />
        <div className="timeline">
          <TimelineItem title="Recommendation" detail="Awaiting later-sprint evidence" />
          <TimelineItem title="Named review" detail="Permission-gated" />
          <TimelineItem title="Simulated submission" detail="No external integration" />
          <TimelineItem title="Outcome" detail="Replayed and clearly simulated" />
        </div>
        <AuditStatusLabel status="Audit schema prepared" />
      </Panel>
    </div>
  );
}

function ProcessNode({
  title,
  detail,
  active
}: {
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className={active ? "process-node active" : "process-node"}>
      <Boxes />
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  );
}
function Placeholder({
  icon: Icon,
  title,
  text
}: {
  icon: typeof Database;
  title: string;
  text: string;
}) {
  return (
    <div className="placeholder-item">
      <Icon />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <CircleDashed />
    </div>
  );
}
function TimelineItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="timeline-item">
      <span />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}
