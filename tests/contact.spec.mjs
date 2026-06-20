import { test, expect } from "@playwright/test";

// Contact form behaviour. The /api/contact Pages Function is mocked so these
// tests are hermetic, no real email is sent and Turnstile/Resend aren't hit.
test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  async function fillForm(page) {
    const form = page.locator("#contact-form");
    await form.getByLabel("Name").fill("Test Person");
    await form.getByLabel("Email").fill("test@example.com");
    await form.getByLabel("Message").fill("Hello from Playwright.");
    return form;
  }

  test("shows a success message when the API accepts", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    const form = await fillForm(page);
    await form.getByRole("button", { name: /send message/i }).click();

    const status = page.locator("#contact-status");
    await expect(status).toHaveClass(/form-status--ok/);
    await expect(status).toContainText(/your message is on its way/i);
  });

  test("shows an error message when the API rejects", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Couldn't send right now." }),
      }),
    );
    const form = await fillForm(page);
    await form.getByRole("button", { name: /send message/i }).click();

    const status = page.locator("#contact-status");
    await expect(status).toHaveClass(/form-status--error/);
    await expect(status).toContainText(/couldn't send/i);
  });

  test("posts JSON to /api/contact with the form values", async ({ page }) => {
    let payload;
    await page.route("**/api/contact", (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    const form = await fillForm(page);
    await form.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator("#contact-status")).toHaveClass(/form-status--ok/);

    expect(payload).toMatchObject({
      name: "Test Person",
      email: "test@example.com",
      message: "Hello from Playwright.",
      company: "", // honeypot stays empty
    });
  });
});
