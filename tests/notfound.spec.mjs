import { test, expect } from "@playwright/test";

// The custom 404 page. With dist/404.html present, Cloudflare Pages (and
// wrangler dev) serve it with a real 404 status for unknown URLs; without it,
// Pages falls back to the home page with HTTP 200 (a soft 404).
test.describe("404 page", () => {
  test("unknown URLs get the branded 404 page with a 404 status", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response.status()).toBe(404);

    await expect(
      page.getByRole("heading", { level: 1, name: /off the grid/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("keeps the site chrome so visitors can navigate on", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator(".site-header__logo img")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
  });

  test("is excluded from search indexes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
