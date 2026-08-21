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

test("PM-01 3D twin binds assets to observable telemetry and replay", async ({ page }) => {
  await page.goto("/virtual-plant");
  await page.getByRole("combobox", { name: "Choose plant view" }).selectOption("model3d");
  const twin = page.getByRole("region", { name: /Chemical Industry.*interactive 3D/ });
  await expect(twin).toContainText("CONNECTED DIGITAL TWIN · REPRESENTATION");
  await expect(twin.getByLabel("Observable history replay")).toBeVisible();
  await page.getByRole("button", { name: "1000×" }).click();
  await page.getByRole("button", { name: /Play/ }).click();
  await expect(twin.getByText(/T\/h/).first()).toBeVisible();
  await twin.getByRole("button", { name: /Reactor/ }).click();
  await expect(page.getByRole("dialog", { name: /R-301/ })).toBeVisible();
  await expect(page.getByText(/Simulator ground truth is not available/)).toBeVisible();
});

test("PM-01 CCTV representation switches plant cameras and shows observable context", async ({
  page
}) => {
  await page.goto("/virtual-plant");
  await page.getByRole("combobox", { name: "Choose plant view" }).selectOption("cctv");
  const cctv = page.getByRole("region", { name: "CCTV plant capture demonstration" });
  await expect(cctv).toContainText("CCTV OPERATIONS VIEW · REPRESENTATION");
  await expect(
    cctv.getByRole("complementary", { name: "Current CCTV equipment context" })
  ).toBeVisible();
  await cctv.getByRole("button", { name: /CAM-16 · Dispatch dock/ }).click();
  await expect(cctv).toContainText("Warehouse loading ledge");
  await expect(cctv).toContainText("No live CCTV stream");
});

test("PM-01 Street View twin navigates linked panoramas with equipment context", async ({
  page
}) => {
  await page.goto("/virtual-plant");
  await page.getByRole("combobox", { name: "Choose plant view" }).selectOption("machinery");
  const tour = page.getByRole("region", { name: /Chemical Industry Street View operational twin/ });
  await expect(tour).toContainText("IMMERSIVE OPERATIONAL TWIN");
  await expect(tour.getByLabel("Drag to look around the 360 degree plant panorama")).toBeVisible();
  await tour.getByRole("button", { name: "Open panorama: Production process" }).click();
  await expect(tour.getByRole("heading", { name: "Production process" })).toBeVisible();
  await expect(
    tour.getByRole("complementary", { name: "Current panorama equipment statistics" })
  ).toContainText("R-301");
  await tour.getByRole("button", { name: /Move forward to Final output/ }).click();
  await expect(tour.getByRole("heading", { name: "Final output & QC" })).toBeVisible();
  await tour.getByRole("button", { name: "Next Street View location" }).click();
  await expect(tour.getByRole("heading", { name: "Packaging line" })).toBeVisible();
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
  await view.selectOption("model3d");
  const model = page.getByRole("region", { name: /Dairy Plant Raw material.*interactive 3D/ });
  await expect(model).toBeVisible();
  await expect(page.getByLabel("Interactive 3D plant model")).toBeVisible();
  await expect(model).toContainText("Milk receiving");
  await expect(model).toContainText("Incoming QC");
  await page.getByRole("button", { name: "Zoom 3D model in" }).click();
  await page.getByRole("button", { name: "Walkaround" }).click();
  await expect(page.getByRole("button", { name: "Exit walkaround" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await section.selectOption("output");
  await expect(
    page.getByRole("region", { name: /Dairy Plant Finished goods.*interactive 3D/ })
  ).toBeVisible();
});
