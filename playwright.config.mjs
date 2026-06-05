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
    channel: "chrome", // use locally installed Google Chrome — no Chromium download
    trace: "on-first-retry",
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
      testIgnore: ["**/responsive.spec.mjs", "**/screenshots.spec.mjs"],
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
  ],
});
