import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://meemur.com",
  srcDir: "./src",
  publicDir: "./public",
  outDir: "./dist",
  build: {
    format: "directory",
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
      // Match the pages' canonical/hreflang tags: locale homes keep the trailing
      // slash, every other URL drops it (directory build adds one by default).
      serialize(item) {
        const homes = new Set(["https://meemur.com/", "https://meemur.com/tr/"]);
        const trim = (url) => (homes.has(url) ? url : url.replace(/\/$/, ""));
        item.url = trim(item.url);
        if (item.links) item.links = item.links.map((link) => ({ ...link, url: trim(link.url) }));
        return item;
      },
    }),
  ],
});
