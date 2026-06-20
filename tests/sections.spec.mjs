import { test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Per-section screenshots, captured at full (1x) resolution straight from the
// element box, NOT a downscaled full-page shot. Each page's header, every
// <main> section, and the footer land in tests/screenshots/sections/ as
// <viewport>-<page>-<NN-label>.png for crisp visual review.
//
// Not a pass/fail assertion (see *.spec.mjs for those). This is a review aid:
// the files are small and legible enough to eyeball one section at a time.
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "screenshots", "sections");

const PAGES = [
  { name: "home", path: "/" },
  { name: "services", path: "/services" },
  { name: "work", path: "/work" },
  { name: "about", path: "/about" },
  { name: "privacy", path: "/privacy" },
  { name: "notfound", path: "/no-such-page" },
];

// Freeze animation so reveals sit at their resting state, and drop the sticky
// header out of flow so it can't overlap the top of a section's element shot.
const FREEZE = `
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .site-header { position: static !important; }
`;

for (const { name, path } of PAGES) {
  test(`sections ${name}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await page.addStyleTag({ content: FREEZE });
    await page.waitForTimeout(200);

    const vp = testInfo.project.name.replace(/^section-/, ""); // mobile | desktop

    const shoot = async (locator, label) => {
      if ((await locator.count()) === 0) return;
      const target = locator.first();
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(50);
      await target.screenshot({ path: join(OUT_DIR, `${vp}-${name}-${label}.png`) });
    };

    await shoot(page.locator(".site-header"), "00-header");

    const sections = page.locator("main > section");
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      // Build a readable label from id or a meaningful class, falling back to
      // the index so order is preserved and names never collide.
      const slug = await section.evaluate((el) => {
        if (el.id) return el.id;
        const cls = [...el.classList].filter((c) => c !== "section");
        return cls[0] ?? "";
      });
      const n = String(i + 1).padStart(2, "0");
      await shoot(section, slug ? `${n}-${slug}` : `${n}-section`);
    }

    await shoot(page.locator(".site-footer"), "99-footer");
  });
}
