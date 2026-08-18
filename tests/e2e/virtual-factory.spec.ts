import { expect, test } from "@playwright/test";

test("PM-01 factory route operates from simulation state", async ({ page }) => {
  await page.goto("/virtual-plant");
  await expect(page.getByRole("heading", { level: 1, name: "Virtual Factory" })).toBeVisible();
  await expect(page.getByText("PM-01 SIMULATION", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Virtual Plant" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  const view = page.getByRole("combobox", { name: "Choose plant view" });
  await expect(view).toHaveValue("process");
  await expect(page.getByRole("heading", { name: "ASC-100 manufacturing line" })).toBeVisible();
  await view.selectOption("data");
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
  await page.getByRole("combobox", { name: "Choose plant view" }).selectOption("data");
  await page.getByRole("button", { name: "Reaction: R-301 thermal loop" }).click();
  await expect(page.getByRole("dialog", { name: /R-301/ })).toBeVisible();
  await expect(page.getByText("Observable measurements")).toBeVisible();
  await expect(page.getByText(/Simulator ground truth is not available/)).toBeVisible();
  await expect(page.getByText(/fouling index/i)).toHaveCount(0);
});

test("PM-01 topology remains usable on a compact presentation viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/virtual-plant");
  await page.getByRole("combobox", { name: "Choose plant view" }).selectOption("data");
  await expect(page.getByRole("heading", { name: "Raw materials to dispatch" })).toBeVisible();
  await expect(page.locator(".pm-process-scroll")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Receiving: Inbound raw materials" })
  ).toBeVisible();
});

test("Virtual Plant switches industry, plant scope, and visual layer", async ({ page }) => {
  await page.goto("/virtual-plant");
  const industry = page.getByRole("combobox", { name: "Choose plant industry" });
  for (const sector of [
    "Chemical Industry",
    "MSME Manufacturing",
    "Clean-tech EPC & Bulk Handling",
    "Dairy Plant",
    "Sugar Factory"
  ]) {
    await expect(industry.getByRole("option", { name: new RegExp(sector) })).toHaveCount(1);
  }

  await industry.selectOption("dairy");
  const section = page.getByRole("combobox", { name: "Choose plant section" });
  const view = page.getByRole("combobox", { name: "Choose plant view" });
  await expect(section).toHaveValue("overall");
  await expect(page.getByRole("region", { name: /Dairy Plant Overall plant/ })).toBeVisible();

  await section.selectOption("input");
  await expect(page.getByRole("region", { name: /Dairy Plant Raw material/ })).toBeVisible();
  await view.selectOption("machinery");
  const machinery = page.getByRole("region", { name: /Dairy Plant Raw material.*machinery/ });
  await expect(machinery).toBeVisible();
  await expect(page.getByAltText(/Dairy Plant machinery/)).toBeVisible();
  await expect(machinery).toContainText("Milk receiving");
  await expect(machinery).toContainText("Incoming QC");
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByText("160%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Walk-through view" }).click();
  await expect(page.getByRole("button", { name: "Exit walk-through" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await section.selectOption("output");
  await expect(
    page.getByRole("region", { name: /Dairy Plant Finished goods.*machinery/ })
  ).toBeVisible();
});
