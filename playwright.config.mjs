import { defineConfig } from "@playwright/test";

// Self-contained: Playwright starts its own wrangler dev server and tears it
// down when the run finishes. Point at a deployed site instead with BASE_URL,
// e.g. BASE_URL=https://meemur.com bun run test (skips the local server).
const PORT = process.env.PORT ?? "8790";
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

// Viewports we verify the page against. Each becomes a Playwright "project",
// so every test runs across all of them.
const VIEWPORTS = {
  "mobile-360": { width: 360, height: 740 },   // small Android
  "mobile-390": { width: 390, height: 844 },   // iPhone 14/15
  "tablet-768": { width: 768, height: 1024 },  // iPad portrait
  "laptop-1366": { width: 1366, height: 768 }, // common laptop
  "desktop-1920": { width: 1920, height: 1080 },
};

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

  projects: Object.entries(VIEWPORTS).map(([name, viewport]) => ({
    name,
    use: { viewport },
  })),
});
