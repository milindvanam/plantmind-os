"use client";

import { Clock3, Database, Gauge, LockKeyhole, ShieldCheck } from "lucide-react";
import "./industrial-timeline.css";
import {
  Alert,
  AuditStatusLabel,
  Badge,
  EmptyState,
  ErrorState,
  Panel,
  SectionHeader,
  SimulatedDataLabel,
  Skeleton,
  StatusIndicator
} from "@/components/ui";
import { useScenario } from "@/features/scenario/scenario-provider";
import { SCENARIO_DURATION_MINUTES } from "@/lib/scenario";
import {
  buildTimelineModel,
  normalizeTimelineValue,
  TIMELINE_SIGNALS,
  type TimelineSignal
} from "./timeline-model";

export type TimelineViewState = "ready" | "loading" | "empty" | "error" | "disabled";

export function IndustrialTimeline({ viewState = "ready" }: { viewState?: TimelineViewState }) {
  const { state, timestamp, jump } = useScenario();
  const model = buildTimelineModel(state.elapsedMinutes);

  if (viewState === "loading") return <TimelineLoading />;
  if (viewState === "empty")
    return (
      <TimelineStateFrame>
        <EmptyState
          title="No replay samples available"
          description="The timeline remains empty until a deterministic scenario dataset is selected."
        />
      </TimelineStateFrame>
    );
  if (viewState === "error")
    return (
      <TimelineStateFrame>
        <ErrorState
          title="Timeline unavailable"
          description="The asset snapshot remains available. Reload the replay history to restore this view."
        />
      </TimelineStateFrame>
    );

  const disabled = viewState === "disabled";

  return (
    <Panel className="industrial-timeline" data-testid="industrial-timeline">
      <SectionHeader
        title="Industrial timeline"
        detail="Eight-hour replay · deterministic measurements and configured stage anchors"
        action={
          <div className="timeline-header-trust">
            <SimulatedDataLabel />
            <StatusIndicator label={model.activeStage.shortLabel} tone={model.activeStage.state} />
          </div>
        }
      />

      <div className="timeline-context" aria-label="Timeline context">
        <div>
          <Clock3 aria-hidden="true" />
          <span>Replay window</span>
          <strong>
            {model.startTime}–{model.endTime} UTC
          </strong>
        </div>
        <div>
          <Database aria-hidden="true" />
          <span>Sampling basis</span>
          <strong>{model.sampleCount} deterministic points per signal</strong>
        </div>
        <div>
          <Gauge aria-hidden="true" />
          <span>Current cursor</span>
          <strong>{timestamp}</strong>
        </div>
      </div>

      {disabled && (
        <Alert title="Timeline interaction restricted" tone="warning">
          Replay history is visible, but stage navigation is disabled for this permission state.
        </Alert>
      )}

      <div className="timeline-stage-scroll" tabIndex={0} aria-label="Scenario stage timeline">
        <ol className="timeline-stage-rail">
          {model.segments.map((segment) => (
            <li
              key={segment.id}
              className={`timeline-stage timeline-stage-${segment.status}`}
              style={{ flexBasis: `${segment.widthPercent}%` }}
            >
              <button
                type="button"
                onClick={() => jump(segment.id)}
                disabled={disabled}
                aria-current={segment.status === "current" ? "step" : undefined}
                aria-label={`Jump to ${segment.label} at ${segment.timestamp} UTC`}
              >
                <span>{segment.timestamp}</span>
                <strong>{segment.shortLabel}</strong>
                <small>{segment.status}</small>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="timeline-chart" aria-label="Replayed signal trends">
        {TIMELINE_SIGNALS.map((signal) => (
          <SignalLane
            key={signal.key}
            signal={signal}
            model={model}
            currentValue={model.currentSample[signal.key]}
          />
        ))}
        <div className="timeline-axis" aria-hidden="true">
          <span>{model.startTime}</span>
          <span>10:00</span>
          <span>{model.endTime}</span>
        </div>
      </div>

      <div className="timeline-current-stage" aria-live="polite">
        <div>
          <span className="eyebrow">Current replay stage</span>
          <strong>{model.activeStage.label}</strong>
          <p>{model.activeStage.description}</p>
        </div>
        <Badge tone="neutral">{Math.round(model.progressPercent)}% through replay</Badge>
      </div>

      <Alert title="Observed replay only" tone="info">
        This visualization shows configured scenario stages and replayed measurements. It does not
        assert an anomaly, diagnosis, cause, safe operating limit, or recommended action.
      </Alert>

      <TimelineTrustStrip sampleCount={model.sampleCount} />
    </Panel>
  );
}

function SignalLane({
  signal,
  model,
  currentValue
}: {
  signal: TimelineSignal;
  model: ReturnType<typeof buildTimelineModel>;
  currentValue: number;
}) {
  const points = model.samples
    .map((sample) => {
      const x = (sample.minute / SCENARIO_DURATION_MINUTES) * 1000;
      const normalized = normalizeTimelineValue(sample[signal.key], signal.domain);
      const y = 82 - normalized * 0.64;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const cursorX = model.progressPercent * 10;
  const cursorY = 82 - normalizeTimelineValue(currentValue, signal.domain) * 0.64;

  return (
    <section className={`timeline-signal timeline-signal-${signal.key}`} aria-label={signal.label}>
      <div className="timeline-signal-meta">
        <div>
          <span>{signal.label}</span>
          <strong>
            {currentValue} <small>{signal.unit}</small>
          </strong>
        </div>
        <div>
          <span>Source</span>
          <code>{signal.source}</code>
        </div>
        <small>
          Display domain {signal.domain[0]}–{signal.domain[1]} {signal.unit}
        </small>
      </div>
      <div className="timeline-plot-scroll" tabIndex={0} aria-label={`${signal.label} plot`}>
        <svg
          viewBox="0 0 1000 96"
          role="img"
          aria-label={`${signal.label} replay trace from ${model.startTime} to ${model.endTime} UTC`}
          preserveAspectRatio="none"
        >
          <line className="timeline-grid-line" x1="0" x2="1000" y1="18" y2="18" />
          <line className="timeline-grid-line" x1="0" x2="1000" y1="50" y2="50" />
          <line className="timeline-grid-line" x1="0" x2="1000" y1="82" y2="82" />
          {model.segments.slice(1).map((segment) => (
            <line
              key={segment.id}
              className="timeline-stage-line"
              x1={segment.startPercent * 10}
              x2={segment.startPercent * 10}
              y1="8"
              y2="88"
            />
          ))}
          <polyline className="timeline-trace" points={points} />
          <line className="timeline-playhead" x1={cursorX} x2={cursorX} y1="4" y2="92" />
          <circle className="timeline-current-point" cx={cursorX} cy={cursorY} r="7" />
        </svg>
      </div>
    </section>
  );
}

function TimelineTrustStrip({ sampleCount }: { sampleCount: number }) {
  return (
    <footer className="timeline-trust-strip" aria-label="Timeline trust status">
      <AuditStatusLabel status="Replay traceable" />
      <Badge tone="evidence">
        <Database aria-hidden="true" /> {sampleCount} source samples
      </Badge>
      <Badge tone="neutral">
        <ShieldCheck aria-hidden="true" /> Evidence quality indeterminate
      </Badge>
      <Badge tone="neutral">
        <Gauge aria-hidden="true" /> Confidence not scored
      </Badge>
      <Badge tone="neutral">
        <LockKeyhole aria-hidden="true" /> Read-only visualization
      </Badge>
    </footer>
  );
}

function TimelineStateFrame({ children }: { children: React.ReactNode }) {
  return (
    <Panel className="industrial-timeline timeline-state" data-testid="industrial-timeline">
      {children}
      <TimelineTrustStrip sampleCount={0} />
    </Panel>
  );
}

function TimelineLoading() {
  return (
    <Panel className="industrial-timeline timeline-state" data-testid="industrial-timeline">
      <span className="sr-only">Loading industrial timeline</span>
      <Skeleton width="42%" />
      <Skeleton />
      <Skeleton />
      <Skeleton width="68%" />
      <TimelineTrustStrip sampleCount={0} />
    </Panel>
  );
}
