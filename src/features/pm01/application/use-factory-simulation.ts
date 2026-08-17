"use client";

import { useEffect, useMemo, useState } from "react";
import type { Pm01SimulationSpeed } from "../contracts/simulation";
import {
  advanceFactoryByRealMilliseconds,
  applyFactoryCommand,
  createFactoryState
} from "../plant-reality/factory-model";
import { PM01_HEALTHY_BASELINE_CONFIG } from "../plant-reality/run-lifecycle";
import { projectFactoryView } from "../observable/factory-projection";

const UI_REFRESH_MILLISECONDS = 250;

export function useFactorySimulation() {
  const [factory, setFactory] = useState(() =>
    createFactoryState("PM01-DEMO-001", {
      ...PM01_HEALTHY_BASELINE_CONFIG,
      durationDays: 60
    })
  );

  useEffect(() => {
    if (factory.run.clock.status !== "RUNNING") return;
    const interval = window.setInterval(() => {
      setFactory((current) => advanceFactoryByRealMilliseconds(current, UI_REFRESH_MILLISECONDS));
    }, UI_REFRESH_MILLISECONDS);
    return () => window.clearInterval(interval);
  }, [factory.run.clock.status]);

  const view = useMemo(() => projectFactoryView(factory), [factory]);
  return {
    view,
    play: () => setFactory((current) => applyFactoryCommand(current, { type: "PLAY" })),
    pause: () => setFactory((current) => applyFactoryCommand(current, { type: "PAUSE" })),
    reset: () => setFactory((current) => applyFactoryCommand(current, { type: "RESET" })),
    setSpeed: (speed: Pm01SimulationSpeed) =>
      setFactory((current) => applyFactoryCommand(current, { type: "SET_SPEED", speed }))
  } as const;
}
