import { test, expect } from "@playwright/test";

// Smoke tests for the privacy policy page.
test.describe("privacy page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacy");
  });

  test("has a privacy page title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/privacy/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /privacy policy/i }),
    ).toBeVisible();
  });

  test("has its own canonical URL", async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://meemur.com/privacy",
    );
  });

  test("covers the data the site actually touches", async ({ page }) => {
    const legal = page.locator(".legal");
    await expect(legal).toContainText(/contact form/i);
    await expect(legal).toContainText(/google analytics/i);
    await expect(legal).toContainText(/newsletter/i);
    await expect(legal).toContainText("onur@meemur.com");
  });

  test("is reachable from the footer on every page", async ({ page }) => {
    for (const path of ["/", "/services", "/about"]) {
      await page.goto(path);
      await expect(
        page.locator('.site-footer a[href="/privacy"]'),
      ).toHaveText(/privacy/i);
    }
  });
});
