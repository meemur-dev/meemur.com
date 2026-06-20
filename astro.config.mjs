import { defineConfig } from "astro/config";

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
});
