import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
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
    ).toHaveLength(7);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/overview");
    expect(screen.queryByRole("link", { name: "Executive Brief" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Industry Solutions" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Decisions & Actions" })).toHaveAttribute(
      "href",
      "/investigations/INV-204"
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
    fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
    expect(screen.getByRole("button", { name: "Show sidebar" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Route content" })).toBeVisible();
  });
});
