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

test("Executive Dashboard presents priority, provenance and explicit unavailable dependencies", async ({
  page
}) => {
  await page.goto("/command");
  await expect(page.getByTestId("executive-dashboard")).toBeVisible();
  await expect(page.getByText("Executive operating snapshot")).toBeVisible();
  await expect(page.getByText("Source").first()).toBeVisible();
  await expect(page.getByText("As of").first()).toBeVisible();
  await expect(page.getByText("Confidence not scored")).toBeVisible();
  await expect(page.getByText("range withheld")).toBeVisible();
  await expect(page.getByRole("link", { name: /Inspect P-204A/ })).toHaveAttribute(
    "href",
    "/assets/P-204A"
  );
});

test("primary navigation reaches the visible operational journey", async ({ page }) => {
  await page.goto("/command");
  for (const route of [
    "/virtual-plant",
    "/operations",
    "/assets/P-204A",
    "/investigations/INV-204"
  ]) {
    await page.locator(`a[href="${route}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
  }
});

test("consolidated workspaces preserve briefing, approval, and outcome routes", async ({
  page
}) => {
  await page.goto("/command");
  await page
    .getByRole("navigation", { name: "Executive Command views" })
    .getByRole("link", { name: "Briefing" })
    .click();
  await expect(page).toHaveURL(/\/briefing$/);

  await page.goto("/investigations/INV-204");
  await page
    .getByRole("navigation", { name: "Decisions and actions workflow" })
    .getByRole("link", { name: "Approval" })
    .click();
  await expect(page).toHaveURL(/\/interventions\/ACT-204$/);
  await page
    .getByRole("navigation", { name: "Decisions and actions workflow" })
    .getByRole("link", { name: "Executive Outcome" })
    .click();
  await expect(page).toHaveURL(/\/executives\/INV-204$/);
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
  await expect(
    page.getByRole("heading", { level: 2, name: "P-204A requires critical attention" })
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

test("Executive Dashboard becomes a readable narrative stack on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/command");
  await expect(page.getByTestId("executive-dashboard")).toBeVisible();
  await expect(page.getByRole("heading", { name: /No active operational risk/ })).toBeVisible();
  await expect(page.getByText("Line throughput")).toBeVisible();
  await expect(page.getByText("What PlantMind knows")).toBeVisible();
});

test("light theme is user selectable", async ({ page }) => {
  await page.goto("/command");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("header text-size controls enlarge the interface and persist", async ({ page }) => {
  await page.goto("/command");
  const menuLabel = page.getByRole("link", { name: "Executive Command" });
  const normalSize = await menuLabel.evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).fontSize)
  );
  await page.getByRole("button", { name: "Use extra large text size" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "extra-large");
  const enlargedSize = await menuLabel.evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).fontSize)
  );
  expect(enlargedSize).toBeGreaterThan(normalSize);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "extra-large");
  await expect(page.getByRole("button", { name: "Use extra large text size" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
