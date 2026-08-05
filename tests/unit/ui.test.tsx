import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Alert,
  Badge,
  Button,
  ConfidenceIndicator,
  EmptyState,
  ErrorState,
  Input,
  Select,
  TableShell,
  Textarea
} from "@/components/ui";

describe("shared UI foundation", () => {
  it("renders foundational variants with accessible semantics", () => {
    render(
      <>
        <Button>Continue</Button>
        <Button variant="secondary">Review</Button>
        <Badge tone="warning">Warning</Badge>
        <ConfidenceIndicator value={82} />
        <Alert title="Notice">Details</Alert>
        <Input aria-label="Name" />
        <Select aria-label="Site">
          <option>Dahej</option>
        </Select>
        <Textarea aria-label="Notes" />
      </>
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(screen.getByText("Confidence 82%")).toBeVisible();
    expect(screen.getByLabelText("Site")).toBeVisible();
  });
  it("exposes empty and error states without using colour alone", () => {
    render(
      <>
        <EmptyState title="No records" description="Nothing matched." />
        <ErrorState />
      </>
    );
    expect(screen.getByText("No records")).toBeVisible();
    expect(screen.getByRole("alert")).toBeVisible();
  });
  it("renders a semantic table shell", () => {
    render(<TableShell headers={["Asset", "State"]} rows={[["P-204A", "Normal"]]} />);
    expect(screen.getByRole("columnheader", { name: "Asset" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "P-204A" })).toBeVisible();
  });
});
