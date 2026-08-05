import { expect, test } from "@playwright/test";

test.describe("development Founder Review states", () => {
  test("loading state is inspectable", async ({ page }) => {
    await page.goto("/command?founder-state=loading");
    await expect(page.getByLabel("Loading executive dashboard")).toBeVisible();
  });

  test("empty state is inspectable", async ({ page }) => {
    await page.goto("/command?founder-state=empty");
    await expect(
      page.getByText("The dashboard has a consistent replay snapshot but no priority exception.")
    ).toBeVisible();
  });

  test("error state is inspectable", async ({ page }) => {
    await page.goto("/command?founder-state=error");
    await expect(page.getByText(/CMD-SNAPSHOT-001/)).toBeVisible();
    await expect(page.getByText("Executive snapshot could not be refreshed")).toBeVisible();
  });

  test("disabled state is inspectable", async ({ page }) => {
    await page.goto("/command?founder-state=disabled");
    await expect(
      page.getByText("Financial fields are hidden for this permission context.")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open calculation" })).toBeDisabled();
  });
});
