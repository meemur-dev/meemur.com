import { expect, test } from "@playwright/test";

// Visual regression: compares the local build against a committed baseline.
// The baseline is captured FROM production (meemur.com) — see the
// `baseline:meemur` npm script — so a failure means the local build has drifted
// visually from the live site. Baselines live in tests/visual/ (committed); the
// capture-only specs (screenshots/sections) remain a separate review aid.
//
// Runs under the visual-mobile / visual-desktop projects (see
// playwright.config.mjs). Snapshot files are platform-agnostic so a baseline
// captured on one machine compares cleanly on another.
const PAGES = [
  { name: "home", path: "/" },
  { name: "services", path: "/services" },
  { name: "work", path: "/work" },
  { name: "about", path: "/about" },
  { name: "privacy", path: "/privacy" },
  // Any unknown URL renders the custom 404 page.
  { name: "notfound", path: "/no-such-page" },
];

// Freeze every animation/transition to its resting frame so the capture is
// deterministic. This settles three sources of motion to a static state:
//   - scroll-driven reveals (motion.css, animation-timeline: view()) → resolve
//     to opacity:1 / no translate, so below-the-fold content is fully revealed
//     in a fullPage shot instead of stuck at its opacity:0 entry frame;
//   - the infinite drifting background blobs (base.css) → sit at their CSS
//     inset positions with no transform;
//   - the hero load-in and cross-document view transitions.
// (animations:"disabled" in toHaveScreenshot is belt-and-suspenders on top.)
const FREEZE = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
`;

for (const { name, path } of PAGES) {
  test(`visual ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.addStyleTag({ content: FREEZE });
    // Web fonts must be in before the shot or text metrics shift between runs.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
