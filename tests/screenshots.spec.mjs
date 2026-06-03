import { test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Captures one screenshot per viewport into tests/screenshots/<viewport>.png
// for manual / agent visual review. Not a pass/fail assertion — see
// coming-soon.spec.mjs for those.
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "screenshots");

test("capture viewport screenshot", async ({ page }, testInfo) => {
  await page.goto("/");
  // let the rise/blob animations settle into a representative frame
  await page.waitForTimeout(800);
  await page.screenshot({
    path: join(OUT_DIR, `${testInfo.project.name}.png`),
    fullPage: true,
  });
});
