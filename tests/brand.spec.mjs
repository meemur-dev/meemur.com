import { test, expect } from "@playwright/test";

// Smoke tests for the hidden /brand press & media kit. It must render its core
// content, stay out of search indexes, and stay unlinked from the homepage.
test.describe("brand press kit", () => {
  test("renders the press kit title and logo", async ({ page }) => {
    await page.goto("/brand/");
    await expect(page).toHaveTitle(/press & media kit/i);
    await expect(
      page.getByRole("img", { name: "meemur", exact: true }),
    ).toBeVisible();
  });

  test("is marked noindex (meta + X-Robots-Tag header)", async ({ page, request, baseURL }) => {
    await page.goto("/brand/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/i,
    );
    const res = await request.get(`${baseURL}/brand/`);
    expect((res.headers()["x-robots-tag"] ?? "")).toMatch(/noindex/i);
  });

  test("robots.txt disallows /brand", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/robots.txt`);
    expect(await res.text()).toContain("Disallow: /brand");
  });

  test("offers a downloadable SVG logo", async ({ page }) => {
    await page.goto("/brand/");
    await expect(
      page.locator('a[download="meemur-logo.svg"]'),
    ).toHaveAttribute("href", "/logo.svg");
  });

  test("exposes the brand color hex values", async ({ page }) => {
    await page.goto("/brand/");
    await expect(page.getByText("#00A9B8")).toBeVisible();
    await expect(page.getByText("#3C3C3D")).toBeVisible();
  });

  test("stays unlinked from the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href*="brand"]')).toHaveCount(0);
  });
});
