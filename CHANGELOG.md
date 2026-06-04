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

### Changed

- `robots.txt` now disallows `/brand` to keep the press kit out of search.

## [0.1.0] - 2026-06-03

### Added

- Initial coming-soon page for meemur.com.
- Animated background: drifting gradient blobs over a faint tech grid.
- Brand slogan and tagline copy.
- Logo wordmark with the "DIGITAL AGENCY" subtitle outlined to a vector path,
  so it no longer depends on a webfont.
- Self-hosted Montserrat (Latin subset) with a metric-matched fallback to
  prevent layout shift (replaces the initial Google Fonts dependency).
- SEO metadata, canonical URL, Open Graph / Twitter tags, and
  Organization + WebSite + Person structured data (JSON-LD).
- `robots.txt`, `LICENSE`, and a favicon.
- Auto-expanding footer copyright year (e.g. `2026` → `2026–2027`).
- Build-version stamping (`/version.json` + `<meta name="version">`) wired into
  the Cloudflare Pages build.
- Google Tag Manager / Google Analytics.
- Playwright viewport tests across mobile, tablet, laptop, and desktop.

### Accessibility

- Slogan color darkened to teal `#00798a` (~4.8:1) to meet WCAG AA contrast.
- Responsive polish across viewports (slogan wrap, headline scaling, off-canvas
  blob to avoid a hard corner arc).

[Unreleased]: https://github.com/meemur-dev/meemur.com/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/meemur-dev/meemur.com/releases/tag/v0.1.0
