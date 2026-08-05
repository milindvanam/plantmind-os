"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Database,
  Factory,
  FileSearch,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  type LucideIcon
} from "lucide-react";
import {
  Alert,
  AuditStatusLabel,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  EvidenceIndicator,
  Panel,
  SectionHeader,
  SimulatedDataLabel,
  Skeleton,
  StatusIndicator
} from "@/components/ui";
import { useScenario } from "@/features/scenario/scenario-provider";
import { buildCommandSnapshot, type CommandMetric } from "./command-snapshot";

export type ExecutiveDashboardState = "ready" | "loading" | "empty" | "error" | "disabled";

export function ExecutiveDashboard({
  viewState = "ready"
}: {
  viewState?: ExecutiveDashboardState;
}) {
  const { state, jump } = useScenario();
  const snapshot = buildCommandSnapshot(state);

  if (viewState === "loading") return <CommandLoadingState />;
  if (viewState === "error") return <CommandErrorState />;
  if (viewState === "empty") return <CommandEmptyState onJump={() => jump("warning")} />;

  return (
    <div className="page-stack executive-dashboard" data-testid="executive-dashboard">
      <CommandHero snapshot={snapshot} onJump={() => jump("warning")} />
      <ExecutiveKPIGrid metrics={snapshot.metrics} />
      <div className="command-decision-grid">
        <PriorityRiskCard snapshot={snapshot} />
        <div className="command-side-stack">
          <ImpactRangeCard reason={snapshot.impact.reason} restricted={viewState === "disabled"} />
          <OperationsHeadBriefCard reason={snapshot.operationsBrief.reason} />
        </div>
      </div>
      <div className="command-bottom-grid">
        <ActionStatusTimeline snapshot={snapshot} />
        <TrustStrip snapshot={snapshot} />
      </div>
      <JourneyStrip />
    </div>
  );
}

function CommandHero({
  snapshot,
  onJump
}: {
  snapshot: ReturnType<typeof buildCommandSnapshot>;
  onJump: () => void;
}) {
  return (
    <section className="command-hero" aria-labelledby="command-priority-heading">
      <div className="command-hero-copy">
        <div className="priority-top">
          <Badge tone="ai">EXECUTIVE DECISION SURFACE</Badge>
          <StatusIndicator label={snapshot.stage.label} tone={snapshot.stage.state} />
        </div>
        <div>
          <span className="eyebrow">Current operational priority</span>
          <h2 id="command-priority-heading">{snapshot.priority.title}</h2>
          <p>{snapshot.priority.summary}</p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/assets/P-204A">
            Inspect P-204A <ArrowRight size={15} />
          </Link>
          {!snapshot.priority.active && (
            <Button variant="secondary" onClick={onJump}>
              Jump to warning
            </Button>
          )}
          <Link className="button button-quiet" href="/operations">
            Open plant context
          </Link>
        </div>
      </div>
      <aside className="command-hero-meta" aria-label="Snapshot truth and decision status">
        <div>
          <span>Scenario truth</span>
          <strong>
            <SimulatedDataLabel />
          </strong>
        </div>
        <div>
          <span>As of</span>
          <strong className="tabular">{snapshot.asOf}</strong>
        </div>
        <div>
          <span>Decision clock</span>
          <strong>{snapshot.priority.decisionClock}</strong>
        </div>
        <div>
          <span>Replay status</span>
          <strong className="capitalize">{snapshot.replayStatus}</strong>
        </div>
      </aside>
    </section>
  );
}

function ExecutiveKPIGrid({ metrics }: { metrics: CommandMetric[] }) {
  return (
    <section aria-labelledby="executive-kpi-heading">
      <SectionHeader
        title="Executive operating snapshot"
        detail="Every value includes unit, source, as-of time and replay truth"
      />
      <h2 id="executive-kpi-heading" className="sr-only">
        Executive KPI grid
      </h2>
      <div className="executive-kpi-grid">
        {metrics.map((metric) => (
          <ExecutiveKPICard key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}

export function ExecutiveKPICard({ metric }: { metric: CommandMetric }) {
  return (
    <Card className="executive-kpi-card">
      <div className="kpi-card-head">
        <span>{metric.label}</span>
        <StatusIndicator label={metric.status} tone={metric.status} />
      </div>
      <div className="kpi-value">
        <strong>{metric.value}</strong>
        <span>{metric.unit}</span>
      </div>
      <p>{metric.detail}</p>
      <dl className="kpi-provenance">
        <div>
          <dt>Source</dt>
          <dd>{metric.source}</dd>
        </div>
        <div>
          <dt>As of</dt>
          <dd>{metric.asOf}</dd>
        </div>
      </dl>
    </Card>
  );
}

function PriorityRiskCard({ snapshot }: { snapshot: ReturnType<typeof buildCommandSnapshot> }) {
  return (
    <Panel className="priority-risk-card">
      <SectionHeader
        title="Priority exception"
        detail="One focus asset, not an unranked alarm wall"
        action={
          <StatusIndicator
            label={snapshot.priority.active ? snapshot.stage.shortLabel : "No active risk"}
            tone={snapshot.stage.state}
          />
        }
      />
      {snapshot.priority.active ? (
        <div className="risk-summary">
          <div className="risk-asset-mark">
            <Activity />
            <span>
              <strong>P-204A</strong>
              <small>Cooling Water Pump · Reactor Line 2</small>
            </span>
          </div>
          <h3>{snapshot.priority.title}</h3>
          <p>{snapshot.stage.description}</p>
          <dl className="risk-facts">
            <div>
              <dt>Observed state</dt>
              <dd>{snapshot.stage.label}</dd>
            </div>
            <div>
              <dt>Diagnosis</dt>
              <dd>Not calculated</dd>
            </div>
            <div>
              <dt>Decision status</dt>
              <dd>No governed proposal</dd>
            </div>
          </dl>
          <Alert title="Bounded interpretation" tone="warning">
            This card reports the configured replay stage and raw context. It does not assert an
            anomaly, cause, safe operating limit or recommendation.
          </Alert>
        </div>
      ) : (
        <EmptyState
          title="No active operational risk at this scenario stage"
          description="Continue the deterministic replay or jump to Warning in demo mode. Missing analysis is not converted into a Normal claim."
        />
      )}
    </Panel>
  );
}

function ImpactRangeCard({ reason, restricted }: { reason: string; restricted: boolean }) {
  return (
    <Panel className="unavailable-panel" aria-label="Impact range">
      <SectionHeader
        title="Production & value exposure"
        detail="Deterministic calculation required"
        action={<Badge tone="neutral">Unavailable</Badge>}
      />
      <div className="unavailable-value">
        —<span>range withheld</span>
      </div>
      <p>{restricted ? "Financial fields are hidden for this permission context." : reason}</p>
      <Button variant="secondary" disabled>
        <LockKeyhole size={14} />
        Open calculation
      </Button>
    </Panel>
  );
}

function OperationsHeadBriefCard({ reason }: { reason: string }) {
  return (
    <Panel className="unavailable-panel" aria-label="AI Operations Head brief">
      <SectionHeader
        title="AI Operations Head"
        detail="Executive interpretation"
        action={<Badge tone="ai">Not generated</Badge>}
      />
      <p>{reason}</p>
      <div className="brief-schema-preview">
        <span>Situation</span>
        <span>Options</span>
        <span>Decision window</span>
        <span>Owner</span>
      </div>
      <Link className="button button-quiet" href="/executives/INV-204">
        View brief foundation <ArrowRight size={14} />
      </Link>
    </Panel>
  );
}

function ActionStatusTimeline({ snapshot }: { snapshot: ReturnType<typeof buildCommandSnapshot> }) {
  const events = [
    {
      title: "Scenario snapshot",
      detail: `${snapshot.stage.label} · ${snapshot.asOf}`,
      complete: true
    },
    { title: "Evidence review", detail: "Evidence Collection Engine pending", complete: false },
    { title: "Executive interpretation", detail: "No AI brief generated", complete: false },
    { title: "Named decision", detail: snapshot.action.owner, complete: false }
  ];
  return (
    <Panel>
      <SectionHeader
        title="Decision status"
        detail="Current accountable path"
        action={<AuditStatusLabel status="Replay traceable" />}
      />
      <ol className="action-timeline">
        {events.map((event) => (
          <li key={event.title} className={event.complete ? "complete" : "pending"}>
            <span>{event.complete ? <CheckCircle2 /> : <CircleDashed />}</span>
            <div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="next-checkpoint">
        <Clock3 size={14} />
        Next checkpoint · {snapshot.action.nextCheckpoint}
      </p>
    </Panel>
  );
}

function TrustStrip({ snapshot }: { snapshot: ReturnType<typeof buildCommandSnapshot> }) {
  return (
    <Panel>
      <SectionHeader title="What PlantMind knows" detail="Trust boundaries for this snapshot" />
      <div className="trust-status-grid">
        <div>
          <Database />
          <span>
            <strong>Evidence quality</strong>
            <small>Indeterminate · engine pending</small>
          </span>
        </div>
        <div>
          <Gauge />
          <span>
            <strong>Confidence</strong>
            <small>Not scored · no universal percentage</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Audit</strong>
            <small>Scenario state traceable</small>
          </span>
        </div>
        <div>
          <LockKeyhole />
          <span>
            <strong>Control authority</strong>
            <small>None · read-only prototype</small>
          </span>
        </div>
      </div>
      <ul className="trust-reasons">
        {snapshot.trust.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <div className="trust-row">
        <EvidenceIndicator status="Sources labelled" />
        <AuditStatusLabel />
        <Badge tone="confidence">
          <CircleDashed size={13} />
          Confidence not scored
        </Badge>
      </div>
    </Panel>
  );
}

function JourneyStrip() {
  const steps: Array<[LucideIcon, string, string]> = [
    [Gauge, "Command", "Prioritise"],
    [Factory, "Operations", "Context"],
    [Activity, "Asset", "Inspect"],
    [FileSearch, "Investigation", "Explain"],
    [Sparkles, "Briefs", "Compare"],
    [TriangleAlert, "Intervention", "Govern"]
  ];
  return (
    <Panel>
      <SectionHeader title="Evidence-to-action journey" detail="Six connected product routes" />
      <div className="journey">
        {steps.map(([Icon, title, detail], index) => (
          <div className={index === 0 ? "journey-step active" : "journey-step"} key={title}>
            <Icon />
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function CommandLoadingState() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Loading executive dashboard">
      <Alert title="Loading consistent snapshot" tone="info">
        Scenario time is held until the replay snapshot is internally consistent.
      </Alert>
      <div className="executive-kpi-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} />
        ))}
      </div>
      <div className="command-decision-grid">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
}
export function CommandEmptyState({ onJump = () => undefined }: { onJump?: () => void }) {
  return (
    <Panel>
      <EmptyState
        title="No active operational risk at this scenario stage"
        description="The dashboard has a consistent replay snapshot but no priority exception."
      />
      <div className="centered-action">
        <Button onClick={onJump}>Jump to warning</Button>
      </div>
    </Panel>
  );
}
export function CommandErrorState() {
  return (
    <div className="page-stack">
      <Alert title="Snapshot unavailable · CMD-SNAPSHOT-001" tone="critical">
        The last consistent dashboard is preserved where available. Missing fields are withheld,
        never replaced with zero.
      </Alert>
      <ErrorState
        title="Executive snapshot could not be refreshed"
        description="Retry the dashboard. Scenario controls and other routes remain available."
      />
    </div>
  );
}
