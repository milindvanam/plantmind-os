import { expect, test } from "@playwright/test";

test("PM-01 factory route operates from simulation state", async ({ page }) => {
  await page.goto("/virtual-plant");
  await expect(page.getByRole("heading", { level: 1, name: "Virtual Factory" })).toBeVisible();
  await expect(page.getByText("PM-01 SIMULATION", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Virtual Plant" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.getByRole("tab", { name: "Animated plant" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.getByRole("heading", { name: "ASC-100 manufacturing line" })).toBeVisible();
  await page.getByRole("tab", { name: "Statistical view" }).click();
  await expect(page.getByRole("heading", { name: "Raw materials to dispatch" })).toBeVisible();
  await page.getByRole("button", { name: "1000×" }).click();
  await page.getByRole("button", { name: /Play/ }).click();
  await expect(page.locator(".pm-process-map")).toHaveClass(/is-running/);
  await expect(page.locator(".pm-kpi-rail").getByText("Production today")).toBeVisible();
  await page.getByRole("button", { name: /Pause/ }).click();
  await expect(page.locator(".pm-process-map")).toHaveClass(/is-paused/);
});

test("PM-01 asset drill-down exposes observable tags only", async ({ page }) => {
  await page.goto("/virtual-plant");
  await page.getByRole("tab", { name: "Statistical view" }).click();
  await page.getByRole("button", { name: "Reaction: R-301 thermal loop" }).click();
  await expect(page.getByRole("dialog", { name: /R-301/ })).toBeVisible();
  await expect(page.getByText("Observable measurements")).toBeVisible();
  await expect(page.getByText(/Simulator ground truth is not available/)).toBeVisible();
  await expect(page.getByText(/fouling index/i)).toHaveCount(0);
});

test("PM-01 topology remains usable on a compact presentation viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/virtual-plant");
  await page.getByRole("tab", { name: "Statistical view" }).click();
  await expect(page.getByRole("heading", { name: "Raw materials to dispatch" })).toBeVisible();
  await expect(page.locator(".pm-process-scroll")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Receiving: Inbound raw materials" })
  ).toBeVisible();
});
