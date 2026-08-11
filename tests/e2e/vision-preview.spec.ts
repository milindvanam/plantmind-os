import { expect, test } from "@playwright/test";

const previewRoutes = [
  ["/briefing", "Turn fragmented plant data into decisions people can trust and execute."],
  ["/in-action", "See one decision travel from plant signal to accountable action."],
  ["/in-action/power-fgd", "Protect compliance while controlling auxiliary load"],
  [
    "/in-action/cement-bulk-material-handling",
    "Stabilise material flow before it constrains kiln output"
  ],
  ["/connect", "Bring existing industrial systems into one governed decision context."],
  ["/discovery/ceo-morning-brief", "Three decisions deserve leadership attention today."],
  [
    "/discovery/predict-equipment-failure",
    "A transparent prediction is a chain of evidence—not a magic score."
  ],
  [
    "/discovery/ai-executive-team",
    "Specialised agents prepare decisions. Accountable leaders remain in control."
  ]
] as const;

test.describe("CEO Vision Preview", () => {
  for (const [route, heading] of previewRoutes) {
    test(`${route} renders its primary narrative`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
    });
  }

  test("private preview remains usable at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/briefing");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const mobileDestination = page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "In Action" });
    await expect(mobileDestination).toBeVisible();
    await mobileDestination.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("P-204A exposes an honest simulated SAP maintenance handoff", async ({ page }) => {
    await page.goto("/discovery/predict-equipment-failure");
    await expect(
      page.getByRole("heading", { name: "SAP S/4HANA maintenance pathway" })
    ).toBeVisible();
    await expect(page.getByText("Planned connector")).toBeVisible();
    await expect(page.getByText(/Create SAP notification · Simulated write-back/)).toBeVisible();
  });
});
