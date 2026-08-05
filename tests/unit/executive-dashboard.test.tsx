import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CommandEmptyState,
  CommandErrorState,
  CommandLoadingState,
  ExecutiveDashboard
} from "@/features/command/executive-dashboard";
import { buildCommandSnapshot } from "@/features/command/command-snapshot";
import { ScenarioProvider } from "@/features/scenario/scenario-provider";
import { initialReplayState } from "@/lib/scenario";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

describe("Executive Dashboard snapshot", () => {
  it("uses deterministic replay values and preserves unavailable dependencies", () => {
    const snapshot = buildCommandSnapshot({
      ...initialReplayState(),
      elapsedMinutes: 240,
      status: "paused"
    });
    expect(snapshot.stage.id).toBe("warning");
    expect(snapshot.priority.active).toBe(true);
    expect(snapshot.metrics.find((metric) => metric.id === "throughput")?.value).toBe("89.3");
    expect(snapshot.impact.productionRange).toBeNull();
    expect(snapshot.impact.status).toBe("unavailable");
    expect(snapshot.trust.confidence).toBe("not-scored");
    expect(snapshot.operationsBrief.status).toBe("not-generated");
  });

  it("does not turn a normal replay stage into an analytical risk claim", () => {
    const snapshot = buildCommandSnapshot(initialReplayState());
    expect(snapshot.priority.active).toBe(false);
    expect(snapshot.priority.title).toBe("No active operational risk at this scenario stage");
    expect(
      snapshot.metrics.every((metric) => metric.source.length > 0 && metric.asOf.length > 0)
    ).toBe(true);
  });
});

describe("Executive Dashboard states", () => {
  it("renders the ready dashboard with provenance and trust boundaries", () => {
    render(
      <ScenarioProvider>
        <ExecutiveDashboard />
      </ScenarioProvider>
    );
    expect(screen.getByTestId("executive-dashboard")).toBeVisible();
    expect(screen.getByText("Executive operating snapshot")).toBeVisible();
    expect(screen.getByText("Confidence not scored")).toBeVisible();
    expect(
      screen.getAllByText(
        "Impact Assessment is Priority 7 and has not been implemented. Missing values are never displayed as zero."
      ).length
    ).toBeGreaterThan(0);
  });

  it("supports loading, empty and error compositions", () => {
    const { rerender } = render(<CommandLoadingState />);
    expect(screen.getByLabelText("Loading executive dashboard")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    rerender(<CommandEmptyState />);
    expect(screen.getByText("No active operational risk at this scenario stage")).toBeVisible();
    rerender(<CommandErrorState />);
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(screen.getByText(/CMD-SNAPSHOT-001/)).toBeVisible();
  });

  it("supports a permission-restricted impact state", () => {
    render(
      <ScenarioProvider>
        <ExecutiveDashboard viewState="disabled" />
      </ScenarioProvider>
    );
    expect(
      screen.getByText("Financial fields are hidden for this permission context.")
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Open calculation" })).toBeDisabled();
  });
});
