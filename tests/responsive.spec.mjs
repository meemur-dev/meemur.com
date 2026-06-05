import { test, expect } from "@playwright/test";

// Mobile-only: the collapsed nav and hamburger toggle. Runs solely in the
// "mobile" project (see playwright.config.mjs) — the rest of the suite is
// viewport-agnostic and runs once on desktop.
test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hamburger toggles the nav menu open", async ({ page }) => {
    const toggle = page.locator(".nav-toggle");
    const servicesLink = page.locator('.site-nav a[href="/services"]');

    await expect(toggle).toBeVisible();
    await expect(servicesLink).toBeHidden(); // collapsed by default

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(servicesLink).toBeVisible();
  });
});
