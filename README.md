# meemur.com

The marketing website for **meemur**, a boutique digital agency. A statically
built, bilingual (English / Turkish) site hosted on Cloudflare Pages.

## Tech stack

- **Framework:** [Astro](https://astro.build) v6, **statically built** — every
  route is pre-rendered to `dist/` at build time. `astro.config.mjs` sets no
  `output`, so Astro defaults to static (no SSR).
- **Package manager:** [Bun](https://bun.sh) (`packageManager` pinned in
  `package.json`).
- **Hosting:** Cloudflare Pages (project `meemur-com`).
- **Dynamic backend:** Cloudflare Pages Functions in `functions/` (see below).
- **Styling:** plain CSS in `src/styles/` (design tokens, base, components,
  layout, motion, and per-page sheets under `src/styles/pages/`).
- **Fonts:** self-hosted Montserrat (400 / 600 / 700), preloaded.
- **Analytics:** Google Tag Manager / GA4 (`GTM-ND4VP7H4`).
- **Forms:** Cloudflare Turnstile (spam protection) + [Resend](https://resend.com)
  (transactional email).
- **HTML validation:** [`html-validate`](https://html-validate.org) against the
  built output, configured in `.htmlvalidate.json`.

The brand and design system are documented in [`DESIGN.md`](./DESIGN.md).

## Getting started

```bash
bun install
bun run dev          # Astro dev server at http://localhost:4321
```

For local work on the Pages Functions (contact / subscribe forms, geo
middleware), build and run through Wrangler instead:

```bash
cp .dev.vars.example .dev.vars   # then fill in secrets (or leave blank to skip)
bun run preview                  # builds, then `wrangler pages dev ./dist`
```

### Local secrets

Runtime secrets for the Functions live in `.dev.vars` (gitignored). Copy
`.dev.vars.example` and fill in as needed:

- `RESEND_API_KEY` — leave blank to exercise the "email not configured" (503)
  path locally.
- `TURNSTILE_SECRET_KEY` — leave blank to skip the spam check in dev; if set, it
  must pair with the Turnstile site key in use.
- Optional overrides: `CONTACT_TO`, `SUBSCRIBE_TO`, `CONTACT_FROM`.

The Turnstile **site** key is a build-time public var (`PUBLIC_TURNSTILE_SITEKEY`,
see `.env.example`). In production all of these are set as encrypted
secrets / environment variables in the Cloudflare Pages dashboard.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the Astro dev server (runs `predev` to stamp `version.json` first). |
| `bun run build` | Stamp `version.json`, run `astro build`, then copy `functions/` into `dist/functions/`. |
| `bun run preview` | Build, then serve `./dist` with `wrangler pages dev` (exercises Functions locally). |
| `bun run deploy` | Build, then direct-upload `./dist` to Cloudflare Pages (`wrangler pages deploy`). |
| `bun run stamp` | Regenerate `public/version.json` / `<meta name="version">` from `package.json`. |
| `bun run release` | Cut a release (bump version, roll CHANGELOG, re-stamp). See [`RELEASING.md`](./RELEASING.md). |
| `bun run check:version` | Guard that fails if `package.json`, the latest git tag, and the CHANGELOG have drifted apart. |
| `bun run lint:html` | Run `html-validate` over the built `dist/**/*.html`. |
| `bun run design:lint` | Lint `DESIGN.md` with `@google/design.md`. |

## Project structure

```
astro.config.mjs        Astro config (site, i18n: en + /tr, static build)
wrangler.jsonc          Cloudflare Pages project config (pages_build_output_dir)
.htmlvalidate.json      html-validate rules
functions/              Cloudflare Pages Functions (run at the edge)
  _middleware.ts          Geo routing: first-time TR visitors → /tr (cookie-gated)
  api/contact.ts          Contact form → Resend, guarded by Turnstile
  api/subscribe.ts        Subscribe form → Resend, guarded by Turnstile
src/
  pages/                  Routes: English at root, Turkish via [lang]/ (404 at root)
  components/pages/       Shared page bodies (HomePage, AboutPage, … one per page)
  layout/                 Header.astro, Footer.astro
  layouts/                BaseLayout.astro (head, GTM, OG/meta, fonts)
  i18n/                   en.json + tr.json dictionaries, utils.ts accessors
  scripts/                Client-side TS (main, contact, subscribe)
  styles/                 Plain CSS (tokens, base, components, layout, pages/)
scripts/                  Build/release helpers (build-version, release, …)
```

## Internationalization

English is served at the site root; Turkish lives under `/tr`. UI strings come
from flat-key JSON dictionaries (`src/i18n/en.json`, `src/i18n/tr.json`)
accessed through `src/i18n/utils.ts`:

- `useTranslations(locale)` → `t("nav.home")` with fallback to the default
  locale for missing keys.
- `getDictionary(locale)` returns the full typed dictionary.
- `localePath(path, locale)` prefixes a path with the locale (root for `en`).
- `langStaticPaths()` produces the `getStaticPaths` entries for the `[lang]`
  dynamic route (every non-default locale).

Each page is a single shared component in `src/components/pages/`. The English
route is a thin wrapper under `src/pages/` (e.g. `src/pages/about/index.astro`)
rendering `<AboutPage locale="en" />`; the Turkish variant is generated by the
matching `src/pages/[lang]/about/index.astro` dynamic route via `getStaticPaths`,
rendering the same component with `locale="tr"`. The output is fully static.

The 404 is the one exception: Cloudflare serves a single `/404.html` for every
not-found route (including ones under `/tr`), so `src/pages/404.astro` renders in
English and swaps to Turkish at runtime when the path starts with `/tr`.

A Pages Function (`functions/_middleware.ts`) redirects first-time visitors whose
Cloudflare edge country (`CF-IPCountry`) is Turkey to the `/tr` version of the
page they requested. It is cookie-gated (`locale`), so it fires at most once and
respects an existing choice; static assets, `/api/*`, and pages already under
`/tr` pass through untouched.

## Deploying & releasing

See [`RELEASING.md`](./RELEASING.md) for the full release flow (git-flow +
`bun run release`) and the Cloudflare Pages build settings. In short: pushing to
`main` triggers an automatic Cloudflare build + production deploy, while
`bun run deploy` does a direct upload that bypasses Cloudflare's build.
