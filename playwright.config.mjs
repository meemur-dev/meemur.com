import { defineConfig } from "@playwright/test";

// Self-contained: Playwright starts its own wrangler dev server and tears it
// down when the run finishes. Point at a deployed site instead with BASE_URL,
// e.g. BASE_URL=https://meemur.com bun run test (skips the local server).
const PORT = process.env.PORT ?? "8790";
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    channel: "chrome", // use locally installed Google Chrome, no Chromium download
    trace: "on-first-retry",
  },

  // Visual-regression baselines (tests/visual.spec.mjs). Stored per project,
  // WITHOUT the default `-{platform}` suffix, so a baseline captured from
  // production on one OS compares cleanly against a build on another. Capture/
  // refresh them from the live site with `bun run baseline:meemur`.
  snapshotPathTemplate: "tests/visual/{projectName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      // Render at CSS pixels so device scale factor never skews the compare.
      scale: "css",
      // `threshold` is per-pixel colour sensitivity (0–1, lower = stricter).
      // `maxDiffPixels` is an ABSOLUTE budget, not a ratio: a ratio is useless
      // on these tall full-page shots: 1% of millions of pixels hides a whole
      // changed paragraph. Baseline and candidate render on the same Chrome, so
      // unchanged content diffs to ~zero; this small budget only soaks up
      // antialiasing noise while still catching a few words of changed text.
      threshold: 0.2,
      maxDiffPixels: 120,
    },
  },

  // Auto-start the static site unless BASE_URL targets something external.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `bunx wrangler pages dev ./dist --port ${PORT} --ip 127.0.0.1`,
        url: BASE_URL,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },

  // Content/SEO/behaviour is viewport-agnostic, so functional specs run ONCE on
  // desktop instead of across every viewport. Only the responsive spec (mobile
  // nav) needs a phone viewport, and screenshots capture just mobile + desktop.
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 800 } },
      testIgnore: ["**/responsive.spec.mjs", "**/screenshots.spec.mjs", "**/sections.spec.mjs", "**/visual.spec.mjs"],
    },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/responsive.spec.mjs",
    },
    {
      name: "shot-mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/screenshots.spec.mjs",
    },
    {
      name: "shot-desktop",
      use: { viewport: { width: 1440, height: 900 } },
      testMatch: "**/screenshots.spec.mjs",
    },
    // Per-section element shots at full 1x resolution (see sections.spec.mjs)
    // for legible, one-section-at-a-time visual review.
    {
      name: "section-mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/sections.spec.mjs",
    },
    {
      name: "section-desktop",
      use: { viewport: { width: 1440, height: 900 } },
      testMatch: "**/sections.spec.mjs",
    },
    // Visual regression vs. the committed baseline (see visual.spec.mjs). Same
    // two viewports as the screenshot review aid; baselines are captured from
    // meemur.com via `bun run baseline:meemur`.
    {
      name: "visual-mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/visual.spec.mjs",
    },
    {
      name: "visual-desktop",
      use: { viewport: { width: 1440, height: 900 } },
      testMatch: "**/visual.spec.mjs",
    },
  ],
});
