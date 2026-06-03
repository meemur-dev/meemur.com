import { test, expect } from "@playwright/test";

// Smoke tests for the coming-soon page. They're intentionally simple for now —
// each one asserts a key piece of content is present so that future changes
// (or regressions) surface immediately. Runs across every viewport project.
test.describe("coming-soon page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has a meemur page title", async ({ page }) => {
    await expect(page).toHaveTitle(/meemur/i);
  });

  test("shows the logo", async ({ page }) => {
    await expect(page.getByRole("img", { name: "meemur" })).toBeVisible();
  });

  test("shows the slogan", async ({ page }) => {
    await expect(
      page.getByText("We make the web work for you."),
    ).toBeVisible();
  });

  test("shows the headline", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /something great is on the way/i }),
    ).toBeVisible();
  });

  test("shows the web-presence tagline", async ({ page }) => {
    await expect(
      page.getByText(/elevates your entire web presence/i),
    ).toBeVisible();
  });

  test("footer shows the current year", async ({ page }) => {
    await expect(page.locator(".footer")).toContainText(
      String(new Date().getFullYear()),
    );
  });
});
