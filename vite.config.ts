import { defineConfig, type Plugin } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { header } from "./src/layout/header";
import { footer } from "./src/layout/footer";

const root = dirname(fileURLToPath(import.meta.url));

// Build-time partials: inline the shared header/footer into every page so the
// chrome is real static HTML (perfect SEO, no FOUC, no runtime JS for nav).
// Pages mark insertion points with HTML comments:
//   <!--#header active="services"-->   <!--#footer-->
function partials(): Plugin {
  return {
    name: "meemur-partials",
    transformIndexHtml(html) {
      return html
        .replace(/<!--#header(?:\s+active="([^"]*)")?-->/g, (_m, active = "") => header(active))
        .replace(/<!--#footer-->/g, () => footer());
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [partials()],
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        services: resolve(root, "services/index.html"),
        work: resolve(root, "work/index.html"),
        about: resolve(root, "about/index.html"),
      },
    },
  },
});
