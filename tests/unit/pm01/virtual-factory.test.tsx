import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VirtualFactory } from "@/features/pm01/ui/virtual-factory";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function productionValue() {
  const rail = screen.getByRole("region", { name: "Factory overview" });
  return within(rail).getByText("Production today").parentElement?.textContent ?? "";
}

describe("PM-01 virtual factory", () => {
  it("renders the complete process topology and honest intelligence placeholder", () => {
    render(<VirtualFactory />);
    expect(screen.getByRole("heading", { level: 1, name: "Virtual Factory" })).toBeVisible();
    for (const stage of [
      "Receiving",
      "Tank farm",
      "Feed preparation",
      "Reaction",
      "Separation",
      "Finishing",
      "Quality release",
      "Packaging",
      "Finished goods",
      "Dispatch"
    ])
      expect(screen.getByText(stage, { selector: "strong" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Intelligence layer not active" })).toBeVisible();
  });

  it("plays, pauses, changes speed and resets the deterministic factory", () => {
    render(<VirtualFactory />);
    expect(productionValue()).toContain("0.0");
    fireEvent.click(screen.getByRole("button", { name: "1000×" }));
    fireEvent.click(screen.getByRole("button", { name: /Play/ }));
    act(() => vi.advanceTimersByTime(1_000));
    expect(productionValue()).not.toContain("0.0T");
    expect(document.querySelector(".pm-process-map")).toHaveClass("is-running");
    fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
    const pausedValue = productionValue();
    act(() => vi.advanceTimersByTime(1_000));
    expect(productionValue()).toBe(pausedValue);
    expect(document.querySelector(".pm-process-map")).toHaveClass("is-paused");
    fireEvent.click(screen.getByRole("button", { name: /Reset/ }));
    expect(productionValue()).toContain("0.0");
    expect(screen.getByRole("button", { name: "1×" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens observable asset details without ground-truth fields", () => {
    render(<VirtualFactory />);
    fireEvent.click(screen.getByRole("button", { name: "Reaction: R-301 thermal loop" }));
    expect(screen.getByRole("dialog", { name: /R-301/ })).toBeVisible();
    expect(screen.getByText("Observable measurements")).toBeVisible();
    expect(screen.getByText(/Simulator ground truth is not available/)).toBeVisible();
    expect(document.body).not.toHaveTextContent("fouling index");
  });
});
