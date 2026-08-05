import { describe, expect, it } from "vitest";
import { resolveFounderReviewState } from "@/features/review/founder-review-command";

describe("Founder Review state resolver", () => {
  it.each(["ready", "loading", "empty", "error", "disabled"] as const)(
    "allows the approved %s composition in development",
    (state) => {
      expect(resolveFounderReviewState(`?founder-state=${state}`, true)).toBe(state);
    }
  );

  it("ignores review parameters outside development", () => {
    expect(resolveFounderReviewState("?founder-state=error", false)).toBe("ready");
  });

  it("falls back safely for unsupported values", () => {
    expect(resolveFounderReviewState("?founder-state=invented", true)).toBe("ready");
  });
});
