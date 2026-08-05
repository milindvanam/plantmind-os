"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  formatSimulatedTime,
  getStageAt,
  initialReplayState,
  progressReplay,
  SCENARIO_STAGES,
  type ReplaySpeed,
  type ReplayState,
  type ScenarioStageId
} from "@/lib/scenario";

const STORAGE_KEY = "plantmind.replay.v1";

type ScenarioContextValue = {
  state: ReplayState;
  stage: ReturnType<typeof getStageAt>;
  timestamp: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  reset: () => void;
  jump: (stage: ScenarioStageId) => void;
  setSpeed: (speed: ReplaySpeed) => void;
};

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReplayState>(initialReplayState);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored)
        queueMicrotask(() =>
          setState({ ...initialReplayState(), ...JSON.parse(stored) } as ReplayState)
        );
    } catch {
      /* Local persistence is best-effort for the prototype. */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const timer = window.setTimeout(() => {
      void fetch("/api/scenario-state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state)
      }).catch(() => undefined);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state.status !== "running") return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setState((current) => progressReplay(current, delta));
    }, 250);
    return () => window.clearInterval(timer);
  }, [state.status]);

  const update = useCallback(
    (change: Partial<ReplayState>) =>
      setState((current) => ({ ...current, ...change, updatedAt: new Date().toISOString() })),
    []
  );
  const value = useMemo<ScenarioContextValue>(
    () => ({
      state,
      stage: getStageAt(state.elapsedMinutes),
      timestamp: formatSimulatedTime(state.elapsedMinutes),
      start: () => update({ status: "running" }),
      pause: () => update({ status: "paused" }),
      resume: () => update({ status: "running" }),
      restart: () => update({ elapsedMinutes: 0, status: "running" }),
      reset: () => setState(initialReplayState()),
      jump: (stageId) => {
        const stage = SCENARIO_STAGES.find((item) => item.id === stageId);
        if (stage) update({ elapsedMinutes: stage.startMinute, status: "paused" });
      },
      setSpeed: (speed) => update({ speed })
    }),
    [state, update]
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const value = useContext(ScenarioContext);
  if (!value) throw new Error("useScenario must be used within ScenarioProvider");
  return value;
}
