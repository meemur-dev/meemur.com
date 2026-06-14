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
  { name: "work", path: "/work" },
  { name: "about", path: "/about" },
  { name: "privacy", path: "/privacy" },
  // Any unknown URL renders the custom 404 page.
  { name: "notfound", path: "/no-such-page" },
];

for (const { name, path } of PAGES) {
  test(`capture ${name} screenshot`, async ({ page }, testInfo) => {
    await page.goto(path);
    // Freeze all animation so the capture is deterministic: scroll-driven reveals
    // would otherwise leave below-the-fold content at their opacity:0 entry state
    // in a fullPage shot. With animations off, every element sits at its resting
    // (fully revealed) state. Also settles the drifting blobs to a static frame.
    await page.addStyleTag({
      content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUT_DIR, `${testInfo.project.name}-${name}.png`),
      fullPage: true,
    });
  });
}
