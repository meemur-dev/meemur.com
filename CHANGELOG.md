# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-06-19

### Fixed

- The contact API now logs Resend's error status and body when a send fails,
  instead of swallowing it — failures were previously invisible in the function
  logs, making delivery issues hard to diagnose.

## [0.3.0] - 2026-06-18

### Added

- Privacy policy page (`/privacy`) in plain English, covering the contact form,
  newsletter, GA4 analytics, and the processors behind them (Cloudflare, Google,
  Resend), linked from the footer copyright bar.
- Custom 404 page (`404.html`) in the brand look ("off the grid"), served with a
  real 404 status — previously unknown URLs soft-404ed to the home page with
  HTTP 200.
- `sitemap.xml` (all five indexable pages) and a `Sitemap:` pointer in
  `robots.txt`.
- `<link rel="expect" href="#main" blocking="render">` on every page so
  cross-document view transitions never animate to a half-parsed page.
- Playwright specs for the privacy and 404 pages, sitemap coverage in the SEO
  spec, and both new pages in the screenshot run.

- Multi-page marketing site replacing the coming-soon page: Home (`/`),
  Services (`/services`), and About + Contact (`/about`), built with Vite
  (multi-page) + TypeScript + vanilla CSS.
- Shared header (sticky, with a mobile nav toggle) and footer, inlined at build
  time via a Vite partials plugin from `src/layout/*.ts`.
- Six service offerings — Web & E-commerce, Cross-platform Apps, Analytics &
  Measurement, CRO & Experimentation, Accessibility & Performance, and Social
  Media Ads — with line (SVG) icons and benefit-led copy.
- Contact form posting to a Cloudflare Pages Function (`functions/api/contact.ts`)
  with a honeypot + Cloudflare Turnstile spam check and Resend email delivery.
- Per-page SEO (titles, descriptions, canonical, Open Graph / Twitter) with a
  shared OG image; Organization + Person + WebSite JSON-LD on the home page.
- `DESIGN.md` design-system spec (google-labs-code/design.md format), plus a
  `bun run design:lint` script backed by the `@google/design.md` linter.
- Playwright suite rewritten for the multi-page site (home, services, about,
  and the contact form, with a mobile-nav check) and restructured so functional
  specs run once on desktop — keeping the run fast on a static site.

### Fixed

- The six "Learn more" card links on the home page now tell screen readers
  which service they lead to (visually-hidden suffix), and the decorative ✓
  list markers on the services page are no longer announced.

### Changed

- Build now runs Vite (`bun run build`); output moved from `public/` to `dist/`
  for Cloudflare Pages, with `public/` as Vite's static passthrough (fonts,
  favicon, robots, `_headers`, and the `/brand` kit).
- Migrated the package manager from npm to Bun: dropped `package-lock.json`,
  added `bun.lock`, pinned `packageManager: bun@1.3.14`, and switched scripts
  and docs to `bun run`.
- Version stamping and the release script now target the root `index.html`.

### Removed

- The single-page coming-soon `public/index.html`, superseded by the multi-page
  site.

## [0.2.0] - 2026-06-04

### Added

- Hidden `/brand` press & media kit: boilerplate copy, logo (SVG) downloads,
  brand color swatches with click-to-copy, and a Montserrat type specimen.
- Social banner render sheet (`/brand/banners.html`) with exported LinkedIn
  (personal + company), X header, and Open Graph banners at `@1x` and `@2x`,
  styled to match the coming-soon look (grid + drifting teal/purple blobs).
- `X-Robots-Tag: noindex` headers for `/brand*` via `public/_headers`.
- Playwright smoke tests for the `/brand` page.
- Release tooling: `npm run release` (git-flow-aware version bump + CHANGELOG
  roll) and a `npm run check:version` drift guard, also enforced as a test.

### Changed

- `robots.txt` now disallows `/brand` to keep the press kit out of search.

### Fixed

- Restored the missing `<meta name="version">` tag so build-version stamping and
  the version-drift test work again.

## [0.1.1] - 2026-06-03

### Added

- SEO metadata: author, canonical URL, and Open Graph / Twitter card tags.
- JSON-LD structured data: Organization + WebSite + Person (founder).
- `robots.txt`.
- Proprietary `LICENSE` (all rights reserved); `package.json` marked UNLICENSED.
- Auto-expanding footer copyright year (e.g. `2026` → `2026–2027`).
- Build-version stamping (`/version.json` + `<meta name="version">`, synced from
  `package.json`) wired into the Cloudflare Pages build.
- Google Tag Manager (analytics).
- SEO and version-drift smoke tests.

## [0.1.0] - 2026-06-03

### Added

- Initial coming-soon page for meemur.com on Cloudflare Pages.
- Animated background: drifting gradient blobs over a faint tech grid.
- Logo wordmark with the "DIGITAL AGENCY" subtitle outlined to a vector path,
  so it no longer depends on a webfont.
- "We make the web work for you." slogan and a digital-agency tagline.
- Self-hosted Montserrat (Latin subset, 400/600/700) with a metric-matched
  fallback to prevent layout shift (replaces the initial Google Fonts dependency).
- Favicon.
- Playwright viewport tests across mobile, tablet, laptop, and desktop, with
  screenshot capture.

### Accessibility

- Slogan color darkened to teal `#00798a` (~4.8:1) to meet WCAG AA contrast.
- Fit-to-viewport layout and responsive polish (slogan wrap, headline scaling,
  off-canvas blob to avoid a hard corner arc).

[Unreleased]: https://github.com/meemur-dev/meemur.com/compare/0.3.1...HEAD
[0.3.1]: https://github.com/meemur-dev/meemur.com/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/meemur-dev/meemur.com/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/meemur-dev/meemur.com/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/meemur-dev/meemur.com/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/meemur-dev/meemur.com/releases/tag/0.1.0
