import { expect, test } from "@playwright/test";

test("SAP beta sandbox demonstrates a governed maintenance workflow", async ({ page }) => {
  await page.goto("/connect");
  await expect(page.getByRole("heading", { level: 1, name: "Connect a Plant" })).toBeVisible();
  await expect(page.getByText("No live SAP or plant connection")).toBeVisible();
  await page.getByRole("button", { name: "SAP sandbox" }).click();
  const sandbox = page.getByRole("region", { name: "SAP connector sandbox" });
  await sandbox.getByRole("button", { name: /Test sandbox contract/ }).click();
  await sandbox.getByRole("button", { name: /Import sandbox equipment/ }).click();
  await sandbox.getByRole("button", { name: /Prepare notification/ }).click();
  await expect(sandbox.getByText("PLANTMIND DRAFT · NOT IN SAP")).toBeVisible();
  await sandbox.getByRole("button", { name: /Approve simulated submission/ }).click();
  await expect(sandbox.getByText("SIM-SAP-NOTIF-4000128")).toBeVisible();
  await expect(sandbox.getByText(/No SAP endpoint, credential, API call/)).toBeVisible();
});
