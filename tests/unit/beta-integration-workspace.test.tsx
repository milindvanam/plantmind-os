import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BetaIntegrationWorkspace } from "@/features/integrations/beta-integration-workspace";

describe("beta integration workspace", () => {
  it("keeps the SAP sandbox explicitly separated from live systems", () => {
    render(<BetaIntegrationWorkspace />);
    expect(screen.getByRole("heading", { level: 1, name: "Connect a Plant" })).toBeVisible();
    expect(screen.getByText("SANDBOX")).toBeVisible();
    expect(screen.getByText("No live SAP or plant connection")).toBeVisible();
    expect(screen.getByText(/does not connect to safety systems/)).toBeVisible();
  });

  it("runs the governed sandbox workflow without claiming external write-back", () => {
    render(<BetaIntegrationWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "SAP sandbox" }));
    const sandbox = screen.getByRole("region", { name: "SAP connector sandbox" });
    fireEvent.click(within(sandbox).getByRole("button", { name: /Test sandbox contract/ }));
    expect(within(sandbox).getByText("Contract validated")).toBeVisible();
    fireEvent.click(within(sandbox).getByRole("button", { name: /Import sandbox equipment/ }));
    expect(within(sandbox).getByText("Sandbox data synchronized")).toBeVisible();
    fireEvent.click(within(sandbox).getByRole("button", { name: /Prepare notification/ }));
    expect(within(sandbox).getByText("PLANTMIND DRAFT · NOT IN SAP")).toBeVisible();
    fireEvent.click(within(sandbox).getByRole("button", { name: /Approve simulated submission/ }));
    expect(within(sandbox).getByText("SIM-SAP-NOTIF-4000128")).toBeVisible();
    expect(within(sandbox).getByText(/No SAP endpoint, credential, API call/)).toBeVisible();
  });

  it("shows deterministic SAP equipment mappings", () => {
    render(<BetaIntegrationWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Asset mapping" }));
    expect(screen.getByRole("table", { name: "SAP equipment mappings" })).toBeVisible();
    expect(screen.getByText("HX-301 process heat exchanger")).toBeVisible();
    expect(screen.getByText("PM01-UTL-HX")).toBeVisible();
  });
});
