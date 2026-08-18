"use client";

import { useEffect, useState } from "react";
import type { Pm01FactoryView } from "../contracts/visualization";
import type { Pm01SimulationSpeed } from "../contracts/simulation";
import {
  advanceFactoryByRealMilliseconds,
  applyFactoryCommand,
  createFactoryState
} from "../plant-reality/factory-model";
import { PM01_HEALTHY_BASELINE_CONFIG } from "../plant-reality/run-lifecycle";
import { projectFactoryView } from "../observable/factory-projection";

const UI_REFRESH_MILLISECONDS = 250;
const HISTORY_LIMIT = 120;

type FactoryState = ReturnType<typeof createFactoryState>;
type FactorySession = Readonly<{
  factory: FactoryState;
  view: Pm01FactoryView;
  observableHistory: readonly Pm01FactoryView[];
}>;

function sessionWithFactory(
  current: FactorySession,
  factory: FactoryState,
  resetHistory = false
): FactorySession {
  const view = projectFactoryView(factory);
  const latest = current.observableHistory.at(-1);
  const history =
    resetHistory || (latest && new Date(view.run.timestamp) < new Date(latest.run.timestamp))
      ? [view]
      : latest?.run.timestamp === view.run.timestamp
        ? current.observableHistory
        : [...current.observableHistory, view].slice(-HISTORY_LIMIT);
  return { factory, view, observableHistory: history };
}

export function useFactorySimulation() {
  const [session, setSession] = useState<FactorySession>(() => {
    const factory = createFactoryState("PM01-DEMO-001", {
      ...PM01_HEALTHY_BASELINE_CONFIG,
      durationDays: 60
    });
    const view = projectFactoryView(factory);
    return { factory, view, observableHistory: [view] };
  });

  useEffect(() => {
    if (session.factory.run.clock.status !== "RUNNING") return;
    const interval = window.setInterval(() => {
      setSession((current) =>
        sessionWithFactory(
          current,
          advanceFactoryByRealMilliseconds(current.factory, UI_REFRESH_MILLISECONDS)
        )
      );
    }, UI_REFRESH_MILLISECONDS);
    return () => window.clearInterval(interval);
  }, [session.factory.run.clock.status]);

  return {
    view: session.view,
    observableHistory: session.observableHistory,
    play: () =>
      setSession((current) =>
        sessionWithFactory(current, applyFactoryCommand(current.factory, { type: "PLAY" }))
      ),
    pause: () =>
      setSession((current) =>
        sessionWithFactory(current, applyFactoryCommand(current.factory, { type: "PAUSE" }))
      ),
    reset: () =>
      setSession((current) =>
        sessionWithFactory(current, applyFactoryCommand(current.factory, { type: "RESET" }), true)
      ),
    setSpeed: (speed: Pm01SimulationSpeed) =>
      setSession((current) =>
        sessionWithFactory(
          current,
          applyFactoryCommand(current.factory, { type: "SET_SPEED", speed })
        )
      )
  } as const;
}
