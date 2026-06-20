import { test, expect } from "@playwright/test";

// Smoke tests for the /services page: the six anchored service sections, the
// page heading, and the call to action.
const SERVICE_IDS = ["ecommerce", "apps", "analytics", "cro", "performance", "ads"];

test.describe("services page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/services");
  });

  test("has the services title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/services · meemur/i);
    await expect(page.getByRole("heading", { level: 1, name: /what we do/i })).toBeVisible();
  });

  test("renders all six service sections with anchors", async ({ page }) => {
    await expect(page.locator(".service")).toHaveCount(6);
    for (const id of SERVICE_IDS) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("marks Services as the current nav item", async ({ page }) => {
    await expect(
      page.locator('.site-nav a[href="/services"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  test("links the CTA to the contact section", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /get in touch/i }).last(),
    ).toHaveAttribute("href", "/about#contact");
  });
});
