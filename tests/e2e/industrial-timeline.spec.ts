import { expect, test } from "@playwright/test";

test("Industrial Timeline is deterministic, source-linked and replay controlled", async ({
  page
}) => {
  await page.goto("/assets/P-204A");
  const timeline = page.getByTestId("industrial-timeline");
  await expect(timeline).toBeVisible();
  await expect(timeline.getByRole("heading", { name: "Industrial timeline" })).toBeVisible();
  await expect(timeline.getByText("49 deterministic points per signal")).toBeVisible();
  await expect(timeline.getByText("P204A-VIB-01")).toBeVisible();
  await expect(timeline.getByText("Evidence quality indeterminate")).toBeVisible();
  await expect(timeline.getByText("Confidence not scored")).toBeVisible();

  await timeline.getByRole("button", { name: /Jump to Critical conditions/ }).click();
  await expect(timeline.getByText("Critical conditions", { exact: true })).toBeVisible();
  await expect(page.locator(".scenario-compact").getByText("Critical")).toBeVisible();
});

test("Industrial Timeline preserves a readable mobile structure", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/assets/P-204A");
  const timeline = page.getByTestId("industrial-timeline");
  await expect(timeline).toBeVisible();
  await expect(timeline.getByLabel("Vibration plot")).toBeVisible();
  await expect(timeline.getByText("Read-only visualization")).toBeVisible();
  const horizontalOverflow = await timeline
    .getByLabel("Vibration plot")
    .evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(horizontalOverflow).toBe(true);
});
