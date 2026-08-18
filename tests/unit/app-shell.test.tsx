import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/command" }));

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

describe("application shell", () => {
  it("renders enterprise context, fixed permissions, and preview plus operational destinations", () => {
    render(
      <AppShell>
        <h1>Route content</h1>
      </AppShell>
    );
    expect(screen.getByText("Aranya Process Industries")).toBeVisible();
    expect(screen.getAllByText("Executive Viewer").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }).querySelectorAll("a")
    ).toHaveLength(10);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/overview");
    expect(screen.getByRole("link", { name: "Executive Brief" })).toHaveAttribute(
      "href",
      "/briefing"
    );
    expect(screen.getByRole("link", { name: "Data & Integrations" })).toHaveAttribute(
      "href",
      "/real-data"
    );
    expect(screen.getByRole("link", { name: "Virtual Plant" })).toHaveAttribute(
      "href",
      "/virtual-plant"
    );
    expect(screen.getByRole("link", { name: "Executive Command" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Notifications" })).toHaveTextContent(
      "1 notification"
    );
    expect(screen.getByRole("heading", { name: "Route content" })).toBeVisible();
  });
});
