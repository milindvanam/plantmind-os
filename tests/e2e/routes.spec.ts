import { expect, test } from "@playwright/test";
const routes = [
  ["/command", "Operational priorities"],
  ["/operations", "Reactor Line 2"],
  ["/assets/P-204A", "Cooling Water Pump P-204A"],
  ["/investigations/INV-204", "INV-204 · Pump degradation"],
  ["/executives/INV-204", "Decision perspectives"],
  ["/interventions/ACT-204", "ACT-204 · Controlled inspection"]
] as const;
for (const [route, heading] of routes)
  test(`${route} loads in the shared shell`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText("Simulated data").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  });
test("primary navigation reaches all six routes", async ({ page }) => {
  await page.goto("/command");
  for (const [route] of routes.slice(1)) {
    await page.locator(`a[href="${route}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
  }
});
test("scenario controls expose start pause resume reset stage and speed", async ({ page }) => {
  await page.goto("/command");
  await page.locator(".scenario-trigger").click();
  await page.getByRole("button", { name: "Start replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.getByLabel("Jump to scenario stage").selectOption("critical");
  await expect(
    page.getByLabel("Scenario replay controls").getByText("Critical conditions")
  ).toBeVisible();
  await page.getByLabel("Replay speed").selectOption("24");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(
    page.getByLabel("Scenario replay controls").getByText("Normal operation")
  ).toBeVisible();
});
test("responsive navigation remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/command");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Plant Operations" }).click();
  await expect(page).toHaveURL(/\/operations$/);
});
test("light theme is user selectable", async ({ page }) => {
  await page.goto("/command");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
