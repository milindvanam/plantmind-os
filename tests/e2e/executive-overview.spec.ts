import { expect, test } from "@playwright/test";

test.describe("executive overview", () => {
  test("root enters the seven-chapter overview before the product", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/overview$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("decision gap");
    await expect(
      page.getByRole("navigation", { name: "Overview chapters" }).getByRole("button")
    ).toHaveCount(7);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  });

  test("chapters navigate by controls and end at the product entry", async ({ page }) => {
    await page.goto("/overview");
    for (let index = 0; index < 6; index += 1) {
      await page.getByRole("button", { name: "Next chapter" }).click();
    }
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Prove it in 6–8 weeks");
    await page.getByRole("link", { name: "Enter PlantMind OS" }).click();
    await expect(page).toHaveURL(/\/briefing$/);
  });

  test("overview supports keyboard navigation and a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/overview");
    await page.getByRole("button", { name: "Next chapter" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("intelligence layer");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("decision gap");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("intelligence layer");
    await expect(page.getByRole("button", { name: "Previous chapter" })).toBeEnabled();
  });
});
