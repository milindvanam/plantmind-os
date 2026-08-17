import { describe, expect, it } from "vitest";
import {
  getPm01Asset,
  PM01_ASSETS,
  validateAssetRegistry
} from "@/features/pm01/plant-reality/asset-registry";
import {
  getPm01Tag,
  PM01_TAGS,
  validateTagRegistry
} from "@/features/pm01/plant-reality/tag-registry";

describe("PM-01 asset and tag registries", () => {
  it("contains the complete v0.1 hierarchy with valid parent references", () => {
    const result = validateAssetRegistry();
    expect(result.assetCount).toBe(38);
    expect(getPm01Asset("PM-01")?.ratedCapacity).toEqual({ value: 100, unit: "t/day" });
    expect(getPm01Asset("HX-301")?.parentId).toBe("AREA-300");
    expect(getPm01Asset("PKG-701")?.ratedCapacity).toEqual({ value: 5, unit: "t/hour" });
  });

  it("defines between 60 and 100 meaningful tags and valid asset associations", () => {
    const result = validateTagRegistry();
    expect(result.tagCount).toBeGreaterThanOrEqual(60);
    expect(result.tagCount).toBeLessThanOrEqual(100);
    expect(PM01_TAGS.every((tag) => PM01_ASSETS.some((asset) => asset.id === tag.assetId))).toBe(
      true
    );
    expect(getPm01Tag("HX301_PROCESS_OUT_TEMP")?.engineeringUnit).toBe("°C");
    expect(getPm01Tag("CV301_POSITION")?.normalRange).toEqual({ minimum: 0, maximum: 100 });
  });

  it("rejects duplicate assets, duplicate tags and orphan tags", () => {
    expect(() => validateAssetRegistry([...PM01_ASSETS, PM01_ASSETS[0]!])).toThrow(
      "Duplicate PM-01 asset ID"
    );
    expect(() => validateTagRegistry([...PM01_TAGS, PM01_TAGS[0]!])).toThrow(
      "Duplicate PM-01 tag ID"
    );
    expect(() =>
      validateTagRegistry([{ ...PM01_TAGS[0]!, id: "ORPHAN_TAG", assetId: "UNKNOWN" }])
    ).toThrow("unknown asset");
  });
});
