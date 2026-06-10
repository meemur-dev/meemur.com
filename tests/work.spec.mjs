import { test, expect } from "@playwright/test";

// Smoke tests for the /work (case studies) page.
test.describe("work page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
  });

  test("has the work title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/work .* meemur/i);
    await expect(page.getByRole("heading", { level: 1, name: /our work/i })).toBeVisible();
  });

  test("shows the case-study cards", async ({ page }) => {
    await expect(page.locator(".work-grid .work-card")).toHaveCount(4);
  });

  test("marks Work as the current nav item", async ({ page }) => {
    await expect(
      page.locator('.site-nav a[href="/work"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  test("links the CTA to start a project", async ({ page }) => {
    await expect(page.locator(".cta a.btn--primary")).toHaveAttribute("href", "/about#contact");
  });
});
