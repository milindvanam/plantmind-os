import { describe, expect, it } from "vitest";
import {
  addMaterial,
  materialVector,
  scaleMaterial,
  subtractMaterial,
  totalMaterialTonnes
} from "@/features/pm01/plant-reality/material-vector";

describe("PM-01 material vectors", () => {
  it("performs immutable component-level material operations", () => {
    const source = materialVector({ "RM-A": 10, "RM-B": 5 });
    const moved = scaleMaterial(source, 0.25);
    expect(totalMaterialTonnes(moved)).toBe(3.75);
    expect(addMaterial(subtractMaterial(source, moved), moved)).toEqual(source);
  });

  it("rejects negative material and overdrawn transfers", () => {
    expect(() => materialVector({ "RM-A": -1 })).toThrow();
    expect(() =>
      subtractMaterial(materialVector({ "RM-A": 1 }), materialVector({ "RM-A": 2 }))
    ).toThrow();
  });
});
