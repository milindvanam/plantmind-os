import { expect, test } from "@playwright/test";

test("Real Data Lab keeps public evidence separate from simulations", async ({ page }) => {
  await page.goto("/real-data");
  await expect(page.getByRole("heading", { level: 1, name: /Industrial evidence/ })).toBeVisible();
  await expect(page.getByText("REAL INDUSTRIAL DATA").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open in PlantMind/ })).toHaveAttribute(
    "href",
    "/real-data/P-204A"
  );
  await expect(page.getByRole("link", { name: /Open simulated replay/ })).toHaveAttribute(
    "href",
    "/assets/P-204A"
  );
});

test("P-204A real-data replay shows actual cycles, evidence and provenance", async ({ page }) => {
  await page.goto("/real-data/P-204A");
  await expect(page.getByText("REAL INDUSTRIAL DATA").first()).toBeVisible();
  await expect(page.getByText("SIMULATED ASSET CONTEXT")).toBeVisible();
  await expect(page.getByText("UCI operating cycle", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dataset provenance" })).toBeVisible();
  await page.getByRole("button", { name: /Severe condition/ }).click();
  await expect(page.getByRole("heading", { name: /Pump leakage label: 2/ })).toBeVisible();
  await expect(page.getByText("Critical").first()).toBeVisible();
});
