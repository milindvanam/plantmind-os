import { describe, expect, it } from "vitest";
import { GET } from "@/app/knowledge-hub/[[...path]]/route";

function requestHub(path?: string[]) {
  return GET(new Request("http://localhost/knowledge-hub"), {
    params: Promise.resolve({ path })
  });
}

describe("integrated Knowledge Hub route", () => {
  it("serves the Hub homepage from the packaged same-origin artifact", async () => {
    const response = await requestHub();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    await expect(response.text()).resolves.toContain("PlantMind Knowledge Hub");
  });

  it("serves direct article routes", async () => {
    const response = await requestHub([
      "knowledge",
      "01-start-here",
      "industrial-ai-plain-english"
    ]);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain("Industrial AI in Plain English");
  });

  it("rejects traversal and missing resources", async () => {
    expect((await requestHub([".."]))?.status).toBe(404);
    expect((await requestHub(["missing-resource.js"]))?.status).toBe(404);
  });
});
