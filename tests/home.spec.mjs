import { test, expect } from "@playwright/test";

// Smoke tests for the home page. Each asserts a key piece of content/structure
// so regressions surface immediately. Runs across every viewport project.
test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has a meemur page title", async ({ page }) => {
    await expect(page).toHaveTitle(/meemur/i);
  });

  test("shows the header logo", async ({ page }) => {
    await expect(page.locator(".site-header__logo img")).toBeVisible();
  });

  test("shows the hero headline", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /we make the web work for you/i }),
    ).toBeVisible();
  });

  test("shows the hero lead", async ({ page }) => {
    await expect(page.getByText(/design, build, and grow/i)).toBeVisible();
  });

  test("has primary nav links to Services and About", async ({ page }) => {
    const nav = page.locator(".site-nav");
    await expect(nav.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  test("shows the six service cards", async ({ page }) => {
    await expect(page.locator(".services-overview .card")).toHaveCount(6);
  });

  test("has a primary call to action", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /start a project/i }).first(),
    ).toHaveAttribute("href", "/about#contact");
  });

  test("footer shows the current year", async ({ page }) => {
    await expect(page.locator(".site-footer")).toContainText(
      String(new Date().getFullYear()),
    );
  });
});
