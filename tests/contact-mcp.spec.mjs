import { test, expect } from "@playwright/test";

// WebMCP integration for the contact form. No browser ships WebMCP in CI, so
// we stub document.modelContext before the page scripts run, capture the tool
// the page registers, and drive its execute() handler directly.
test.describe("contact form WebMCP tool", () => {
  test.beforeEach(async ({ page }) => {
    // Capture registered tools on window.__mcpTools so tests can invoke them.
    await page.addInitScript(() => {
      window.__mcpTools = [];
      document.modelContext = {
        registerTool(tool) {
          window.__mcpTools.push(tool);
        },
      };
    });
    await page.goto("/about");
  });

  function callTool(page, input) {
    return page.evaluate((args) => {
      const tool = window.__mcpTools.find((t) => t.name === "fill_contact_message");
      if (!tool) throw new Error("fill_contact_message tool was not registered");
      return tool.execute(args);
    }, input);
  }

  test("registers a fill_contact_message tool with a name/email/message schema", async ({ page }) => {
    const tool = await page.evaluate(() =>
      window.__mcpTools.find((t) => t.name === "fill_contact_message"),
    );
    expect(tool).toBeTruthy();
    expect(tool.inputSchema.required).toEqual(["name", "email", "message"]);
    // The honeypot must never be exposed to the agent.
    expect(Object.keys(tool.inputSchema.properties)).not.toContain("company");
  });

  test("fills the form fields and asks the visitor to confirm", async ({ page }) => {
    const result = await callTool(page, {
      name: "Test Person",
      email: "test@example.com",
      message: "Hello from the agent.",
    });

    const form = page.locator("#contact-form");
    await expect(form.getByLabel("Name")).toHaveValue("Test Person");
    await expect(form.getByLabel("Email")).toHaveValue("test@example.com");
    await expect(form.getByLabel("Message")).toHaveValue("Hello from the agent.");
    // The honeypot stays empty — agent-assisted fills must not look like spam.
    await expect(page.locator('#contact-form input[name="company"]')).toHaveValue("");
    expect(result).toMatch(/review/i);
    expect(result).toMatch(/send message/i);
  });

  test("does not send: pressing Send still posts the agent-filled values", async ({ page }) => {
    let payload;
    await page.route("**/api/contact", (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await callTool(page, { name: "Test Person", email: "test@example.com", message: "Hello." });
    // No request should have been made by the tool itself.
    expect(payload).toBeUndefined();

    await page.locator("#contact-form").getByRole("button", { name: /send message/i }).click();
    await expect(page.locator("#contact-status")).toHaveClass(/form-status--ok/);
    expect(payload).toMatchObject({
      name: "Test Person",
      email: "test@example.com",
      message: "Hello.",
      company: "",
    });
  });

  test("rejects an invalid email without filling the form", async ({ page }) => {
    const result = await callTool(page, {
      name: "Test Person",
      email: "not-an-email",
      message: "Hello.",
    });

    expect(result).toMatch(/valid email/i);
    await expect(page.locator("#contact-form").getByLabel("Name")).toHaveValue("");
  });
});
