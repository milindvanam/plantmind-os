"use client";

import { useEffect, useState } from "react";
import {
  ExecutiveDashboard,
  type ExecutiveDashboardState
} from "@/features/command/executive-dashboard";

const REVIEW_STATES = new Set<ExecutiveDashboardState>([
  "ready",
  "loading",
  "empty",
  "error",
  "disabled"
]);

export function resolveFounderReviewState(search: string, enabled: boolean) {
  if (!enabled) return "ready" satisfies ExecutiveDashboardState;
  const requested = new URLSearchParams(search).get("founder-state");
  return requested && REVIEW_STATES.has(requested as ExecutiveDashboardState)
    ? (requested as ExecutiveDashboardState)
    : "ready";
}

export function FounderReviewCommand() {
  const [viewState, setViewState] = useState<ExecutiveDashboardState>("ready");

  useEffect(() => {
    const requested = resolveFounderReviewState(
      window.location.search,
      process.env.NODE_ENV === "development"
    );
    queueMicrotask(() => setViewState(requested));
  }, []);

  return <ExecutiveDashboard viewState={viewState} />;
}
