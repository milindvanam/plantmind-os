import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.PLANTMIND_REVIEW_URL ?? "http://127.0.0.1:3000";
const outputDirectory = path.resolve("docs", "screenshots", "founder-review");

const states = [
  { id: "loading", readyText: "Loading consistent snapshot" },
  {
    id: "empty",
    readyText: "The dashboard has a consistent replay snapshot but no priority exception."
  },
  { id: "error", readyText: "Executive snapshot could not be refreshed" },
  { id: "disabled", readyText: "Financial fields are hidden for this permission context." }
] as const;

async function captureState(page: Page, state: (typeof states)[number]) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/command?founder-state=${state.id}`, { waitUntil: "networkidle" });
  await page.getByText(state.readyText, { exact: false }).first().waitFor();
  if (errors.length > 0) throw new Error(`Browser errors in ${state.id}: ${errors.join("; ")}`);
  await page.screenshot({
    path: path.join(outputDirectory, `${state.id}-state.png`),
    fullPage: true
  });
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const state of states) {
    const page = await context.newPage();
    await captureState(page, state);
    await page.close();
  }
  await context.close();
} finally {
  await browser.close();
}

console.log(`Founder review state screenshots captured in ${outputDirectory}`);
