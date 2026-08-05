import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "@playwright/test";

const baseUrl = process.env.PLANTMIND_REVIEW_URL ?? "http://127.0.0.1:3000";
const phase = process.argv[2] ?? "baseline";
const featureRoute = phase === "priority-2" ? "/assets/P-204A" : "/operations";
const outputDirectory = path.resolve("docs", "screenshots", phase);

async function openPage(context: BrowserContext, route: string) {
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.getByRole("main").waitFor();
  if (errors.length > 0) throw new Error(`Browser errors on ${route}: ${errors.join("; ")}`);
  return page;
}

async function capture(page: Page, name: string, fullPage = true) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDirectory, `${name}.png`), fullPage });
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const home = await openPage(desktop, "/");
  await capture(home, "home");

  const dashboard = await openPage(desktop, "/command");
  await dashboard.locator(".scenario-trigger").click();
  await dashboard.getByLabel("Jump to scenario stage").selectOption("warning");
  await dashboard.locator(".scenario-trigger").click();
  await capture(dashboard, "executive-dashboard");

  const desktopView = await openPage(desktop, featureRoute);
  if (phase === "priority-2") {
    await desktopView.getByRole("button", { name: /Jump to Warning conditions/ }).click();
  }
  await capture(desktopView, "desktop-view");

  const darkMode = await openPage(desktop, phase === "priority-2" ? featureRoute : "/command");
  if (phase === "priority-2") {
    await darkMode.getByRole("button", { name: /Jump to Warning conditions/ }).click();
  }
  await capture(darkMode, "dark-mode");

  const lightMode = await openPage(desktop, phase === "priority-2" ? featureRoute : "/command");
  if (phase === "priority-2") {
    await lightMode.getByRole("button", { name: /Jump to Warning conditions/ }).click();
  }
  await lightMode.getByRole("button", { name: "Switch to light theme" }).click();
  await capture(lightMode, "light-mode");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobileView = await openPage(mobile, phase === "priority-2" ? featureRoute : "/command");
  if (phase === "priority-2") {
    await mobileView.locator(".scenario-trigger").click();
    await mobileView.getByLabel("Jump to scenario stage").selectOption("warning");
    await mobileView.locator(".scenario-trigger").click();
  }
  await capture(mobileView, "mobile-view", false);
  await mobile.close();
} finally {
  await browser.close();
}

console.log(`Founder review screenshots captured in ${outputDirectory}`);
