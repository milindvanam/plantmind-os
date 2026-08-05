import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScenarioControls } from "@/features/scenario/scenario-controls";
import { ScenarioProvider } from "@/features/scenario/scenario-provider";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});
describe("scenario replay controls", () => {
  it("starts, pauses, resumes, resets and jumps deterministically", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <ScenarioControls />
      </ScenarioProvider>
    );
    await user.click(screen.getByRole("button", { name: "Start replay" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Resume" })).toBeVisible();
    await user.selectOptions(screen.getByLabelText("Jump to scenario stage"), "critical");
    expect(screen.getByText("Critical conditions")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Normal operation")).toBeVisible();
  });
  it("changes replay speed using the approved values", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <ScenarioControls />
      </ScenarioProvider>
    );
    await user.selectOptions(screen.getByLabelText("Replay speed"), "24");
    expect(screen.getByLabelText("Replay speed")).toHaveValue("24");
  });
});
