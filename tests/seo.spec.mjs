import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// SEO / metadata smoke tests. Simple presence checks that act as regression
// indicators for the head metadata, structured data, and crawler files.
test.describe("seo metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has a canonical URL pointing to the production domain", async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://meemur.com/",
    );
  });

  test("declares Open Graph site name, image, and Twitter card", async ({ page }) => {
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "meemur",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og-image\.png$/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      /summary/,
    );
  });

  test("each page has its own canonical URL", async ({ page }) => {
    for (const [path, canonical] of [
      ["/services", "https://meemur.com/services"],
      ["/work", "https://meemur.com/work"],
      ["/about", "https://meemur.com/about"],
      ["/privacy", "https://meemur.com/privacy"],
    ]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    }
  });

  test("includes valid Organization + WebSite structured data", async ({ page }) => {
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(raw); // throws (fails the test) if malformed
    const types = (data["@graph"] ?? []).map((n) => n["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("Person");
  });

  test("serves a valid robots.txt", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/robots.txt`);
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("User-agent:");
  });

  test("serves a sitemap.xml that robots.txt points at", async ({ request, baseURL }) => {
    const robots = await (await request.get(`${baseURL}/robots.txt`)).text();
    expect(robots).toContain("Sitemap: https://meemur.com/sitemap.xml");

    const res = await request.get(`${baseURL}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<urlset");
    for (const path of ["/", "/services", "/work", "/about", "/privacy"]) {
      expect(xml).toContain(`<loc>https://meemur.com${path}</loc>`);
    }
  });

  test("version marker matches package.json (no drift)", async ({ page, request, baseURL }) => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    // /version.json
    const res = await request.get(`${baseURL}/version.json`);
    expect(res.status()).toBe(200);
    expect((await res.json()).version).toBe(pkg.version);
    // <meta name="version">
    await page.goto("/");
    await expect(page.locator('meta[name="version"]')).toHaveAttribute(
      "content",
      pkg.version,
    );
  });
});
