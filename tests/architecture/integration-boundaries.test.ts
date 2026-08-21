import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("integration security boundaries", () => {
  it("keeps credential collection out of the browser SAP sandbox", () => {
    const source = readFileSync("src/features/integrations/beta-integration-workspace.tsx", "utf8");
    expect(source).not.toMatch(/clientSecret|password|privateKey|accessToken/);
    expect(source).toContain("no secret or credential input");
  });
});
