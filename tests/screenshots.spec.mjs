import { test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Captures a full-page screenshot of each page per viewport into
// tests/screenshots/<viewport>-<page>.png for manual / agent visual review.
// Not a pass/fail assertion — see *.spec.mjs for those.
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "screenshots");

const PAGES = [
  { name: "home", path: "/" },
  { name: "services", path: "/services" },
  { name: "about", path: "/about" },
];

for (const { name, path } of PAGES) {
  test(`capture ${name} screenshot`, async ({ page }, testInfo) => {
    await page.goto(path);
    // let the blob animations settle into a representative frame
    await page.waitForTimeout(800);
    await page.screenshot({
      path: join(OUT_DIR, `${testInfo.project.name}-${name}.png`),
      fullPage: true,
    });
  });
}
