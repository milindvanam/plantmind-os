"use client";

import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Button, Select, SimulatedDataLabel, StatusIndicator } from "@/components/ui";
import {
  REPLAY_SPEEDS,
  SCENARIO_DURATION_MINUTES,
  SCENARIO_STAGES,
  type ReplaySpeed,
  type ScenarioStageId
} from "@/lib/scenario";
import { useScenario } from "./scenario-provider";

export function ScenarioControls({ compact = false }: { compact?: boolean }) {
  const { state, stage, timestamp, start, pause, resume, restart, reset, jump, setSpeed } =
    useScenario();
  const progress = Math.round((state.elapsedMinutes / SCENARIO_DURATION_MINUTES) * 100);
  const primaryAction =
    state.status === "running"
      ? pause
      : state.status === "paused"
        ? resume
        : state.status === "complete"
          ? restart
          : start;
  const primaryLabel =
    state.status === "running"
      ? "Pause"
      : state.status === "paused"
        ? "Resume"
        : state.status === "complete"
          ? "Restart"
          : "Start replay";

  if (compact)
    return (
      <div className="scenario-compact">
        <StatusIndicator tone={stage.state} label={stage.shortLabel} />
        <span className="scenario-time">{timestamp}</span>
        <SimulatedDataLabel />
      </div>
    );

  return (
    <div className="scenario-controls" aria-label="Scenario replay controls">
      <div className="scenario-truth">
        <div>
          <span className="eyebrow">Demo scenario · P-204A</span>
          <strong>{stage.label}</strong>
          <span>{timestamp}</span>
        </div>
        <SimulatedDataLabel />
      </div>
      <div className="scenario-progress" aria-label={`${progress}% through scenario`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="scenario-actions">
        <Button onClick={primaryAction}>
          {state.status === "running" ? <Pause size={15} /> : <Play size={15} />}
          {primaryLabel}
        </Button>
        <Button variant="secondary" onClick={restart}>
          <StepForward size={15} />
          Restart
        </Button>
        <Button variant="quiet" onClick={reset}>
          <RotateCcw size={15} />
          Reset
        </Button>
        <label>
          Stage<span className="sr-only">Jump to scenario stage</span>
          <Select
            aria-label="Jump to scenario stage"
            value={stage.id}
            onChange={(event) => jump(event.target.value as ScenarioStageId)}
          >
            {SCENARIO_STAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortLabel}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Speed<span className="sr-only">Replay speed</span>
          <Select
            aria-label="Replay speed"
            value={state.speed}
            onChange={(event) => setSpeed(Number(event.target.value) as ReplaySpeed)}
          >
            {REPLAY_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}
