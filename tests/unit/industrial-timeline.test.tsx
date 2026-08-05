import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScenarioProvider } from "@/features/scenario/scenario-provider";
import { IndustrialTimeline } from "@/features/timeline/industrial-timeline";
import {
  buildTimelineModel,
  buildTimelineSamples,
  normalizeTimelineValue
} from "@/features/timeline/timeline-model";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

describe("Industrial Timeline model", () => {
  it("creates the same 49-point eight-hour history every time", () => {
    expect(buildTimelineSamples()).toEqual(buildTimelineSamples());
    expect(buildTimelineSamples()).toHaveLength(49);
    expect(buildTimelineSamples().at(0)?.minute).toBe(0);
    expect(buildTimelineSamples().at(-1)?.minute).toBe(480);
  });

  it("preserves all configured stage boundaries and cursor truth", () => {
    const model = buildTimelineModel(240);
    expect(model.activeStage.id).toBe("warning");
    expect(model.progressPercent).toBe(50);
    expect(model.segments).toHaveLength(6);
    expect(model.segments.find((segment) => segment.id === "warning")?.status).toBe("current");
    expect(model.currentSample).toEqual(buildTimelineModel(240).currentSample);
  });

  it("clamps chart normalization to its declared display domain", () => {
    expect(normalizeTimelineValue(-1, [0, 10])).toBe(0);
    expect(normalizeTimelineValue(5, [0, 10])).toBe(50);
    expect(normalizeTimelineValue(12, [0, 10])).toBe(100);
  });
});

describe("Industrial Timeline states and interaction", () => {
  it("renders source-linked signal lanes and honest trust boundaries", () => {
    render(
      <ScenarioProvider>
        <IndustrialTimeline />
      </ScenarioProvider>
    );
    expect(screen.getByTestId("industrial-timeline")).toBeVisible();
    expect(screen.getByLabelText("Vibration")).toBeVisible();
    expect(screen.getByText("P204A-VIB-01")).toBeVisible();
    expect(screen.getByText("Evidence quality indeterminate")).toBeVisible();
    expect(screen.getByText("Confidence not scored")).toBeVisible();
    expect(screen.getByText("Observed replay only")).toBeVisible();
  });

  it("uses the existing replay provider for stage navigation", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <IndustrialTimeline />
      </ScenarioProvider>
    );
    await user.click(
      screen.getByRole("button", { name: "Jump to Warning conditions at 10:00 UTC" })
    );
    expect(screen.getByText("50% through replay")).toBeVisible();
    expect(
      screen.getByText("Several simulated measurements move outside their operating bands.")
    ).toBeVisible();
  });

  it("supports loading, empty, error and disabled states", () => {
    const { rerender } = render(
      <ScenarioProvider>
        <IndustrialTimeline viewState="loading" />
      </ScenarioProvider>
    );
    expect(screen.getByText("Loading industrial timeline")).toBeInTheDocument();
    rerender(
      <ScenarioProvider>
        <IndustrialTimeline viewState="empty" />
      </ScenarioProvider>
    );
    expect(screen.getByText("No replay samples available")).toBeVisible();
    rerender(
      <ScenarioProvider>
        <IndustrialTimeline viewState="error" />
      </ScenarioProvider>
    );
    expect(screen.getByText("Timeline unavailable")).toBeVisible();
    rerender(
      <ScenarioProvider>
        <IndustrialTimeline viewState="disabled" />
      </ScenarioProvider>
    );
    expect(screen.getByText("Timeline interaction restricted")).toBeVisible();
    expect(
      screen
        .getAllByRole("button", { name: /Jump to/ })
        .every((button) => button.hasAttribute("disabled"))
    ).toBe(true);
  });
});
