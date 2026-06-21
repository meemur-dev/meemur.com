import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://meemur.com",
  srcDir: "./src",
  publicDir: "./public",
  outDir: "./dist",
  build: {
    // Emit slashless files (services.html, not services/index.html) so Cloudflare
    // Pages serves /services with a 200 and 308-redirects the trailing-slash form
    // to it, matching the slashless canonical/hreflang/sitemap URLs.
    format: "file",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "tr"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // Emit hreflang alternates linking each EN page to its /tr counterpart.
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", tr: "tr" },
      },
      // The 404 is noindex; keep it out of the sitemap.
      filter: (page) => !page.includes("/404"),
      // Match the pages' canonical/hreflang tags: every URL is slashless except
      // the site root (kept as ".../"), so the sitemap never lists a URL that
      // 308-redirects.
      serialize(item) {
        const trim = (url) => (url === "https://meemur.com/" ? url : url.replace(/\/$/, ""));
        item.url = trim(item.url);
        if (item.links) item.links = item.links.map((link) => ({ ...link, url: trim(link.url) }));
        return item;
      },
    }),
  ],
});
