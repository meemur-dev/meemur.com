import { test, expect } from "@playwright/test";

// Smoke tests for the /about page: founder content, the contact section, and
// the contact form fields + direct email fallback.
test.describe("about page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("has the about title and founder", async ({ page }) => {
    await expect(page).toHaveTitle(/about .* meemur/i);
    await expect(page.getByRole("heading", { name: "Onur Yanar" })).toBeVisible();
  });

  test("has a contact section reachable by anchor", async ({ page }) => {
    await expect(page.locator("#contact")).toBeAttached();
    await expect(page.getByRole("heading", { name: /let's talk about your project/i })).toBeVisible();
  });

  test("offers a direct mailto fallback", async ({ page }) => {
    await expect(
      page.locator('#contact a[href="mailto:contact@meemur.com"]'),
    ).toBeVisible();
  });

  test("renders the contact form fields", async ({ page }) => {
    const form = page.locator("#contact-form");
    await expect(form.getByLabel("Name")).toBeVisible();
    await expect(form.getByLabel("Email")).toBeVisible();
    await expect(form.getByLabel("Message")).toBeVisible();
    await expect(form.getByRole("button", { name: /send message/i })).toBeVisible();
  });
});
