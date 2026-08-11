import { describe, expect, it } from "vitest";
import { connectors, sectorJourneys, truthClasses } from "@/features/vision/vision-data";

describe("CEO vision preview fixtures", () => {
  it("keeps the two approved flagship sector journeys", () => {
    expect(sectorJourneys.map(({ slug }) => slug)).toEqual([
      "power-fgd",
      "cement-bulk-material-handling"
    ]);
  });

  it("uses only approved connector statuses", () => {
    expect(new Set(connectors.map(({ status }) => status))).toEqual(
      new Set(["Demo", "Planned", "Custom"])
    );
  });

  it("exposes all seven exact truth classes", () => {
    expect(truthClasses).toHaveLength(7);
    expect(truthClasses).toContain("AI-GENERATED CONTENT");
    expect(truthClasses).toContain("SOURCED EXTERNAL CONTENT");
  });
});
