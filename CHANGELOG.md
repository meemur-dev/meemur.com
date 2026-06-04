# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/meemur-dev/meemur.com/compare/0.1.1...HEAD
[0.1.1]: https://github.com/meemur-dev/meemur.com/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/meemur-dev/meemur.com/releases/tag/0.1.0
