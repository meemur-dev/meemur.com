# Releasing

Versioning is driven by **git-flow** + a small release script, with a guard test
that fails if anything drifts. `package.json` is the single source of truth;
git tags and `version.json` derive from it.

## Cut a release

```bash
git flow release start 0.2.0     # branch off develop (use the real next version)
bun run release                  # infers 0.2.0 from the branch name; bumps
                                 # package.json, rolls CHANGELOG [Unreleased]
                                 # → [0.2.0], re-stamps version.json, and commits
git flow release finish 0.2.0    # merges to main + develop and creates tag 0.2.0
git push origin main develop --tags
```

`bun run release` also accepts an explicit bump or version, and a preview:

```bash
bun run release -- minor     # or major | patch
bun run release -- 0.2.0     # pin a version
bun run release -- --dry-run # show the bump without writing
```

Hotfixes work the same way with `git flow hotfix start <x.y.z>`.

## Deploying

The site runs on **Cloudflare Pages** (project `meemur-com`). Two paths reach
production:

1. **Git integration:** pushing to `main` triggers an automatic Cloudflare
   build + production deploy; other branches (e.g. `develop`) build as
   previews. This is the normal path after `git push origin main develop --tags`.
2. **Direct upload:** `bun run deploy` builds locally and uploads `./dist`
   straight to Pages, bypassing Cloudflare's build. Handy when the git build is
   unavailable.

### Pages build settings (must match the repo)

| Setting | Value |
| --- | --- |
| Build command | `bun install --frozen-lockfile && bun run build` |
| Build output directory | `dist` (also set as `pages_build_output_dir` in `wrangler.jsonc`) |

⚠️ Two gotchas, both learned the hard way:

- **Install first.** Cloudflare's git build does not reliably install
  dependencies on its own, and the build tools (`astro`, `typescript`, …) live
  in dependencies/`devDependencies`. Without an explicit install the build dies
  on `astro: command not found` (exit 127). `bun install --frozen-lockfile` is
  the `npm ci` equivalent, deterministic from `bun.lock`, never mutates it.
- **Run the full build.** `bun run build` is **multiple steps**
  (`node scripts/build-version.mjs && astro build && cp -R functions/ dist/functions/`).
  If the build command is set to only `node scripts/build-version.mjs`, it stamps
  `version.json` but never runs `astro build`, so `dist/` is never produced and
  the build fails with `Error: Output directory "dist" not found`. The final
  copy step stages the Cloudflare Pages Functions (`functions/`) alongside the
  static output so they deploy with the site.

Note: **retrying** a failed deployment replays the build config captured when it
was created; it does *not* pick up changed build settings. After editing the
build command, trigger a **new** deployment (push a commit) to apply it.

## What keeps it honest

- **`bun run check:version`** fails if `package.json` is behind the latest git
  tag, or if the CHANGELOG has no section for that tag. Run it manually or in
  CI. This is the check that would have caught `0.1.1` shipping while
  `package.json` still said `0.1.0`.
- **`scripts/build-version.mjs`** keeps `/version.json` and the page's
  `<meta name="version">` in sync with `package.json` on every build/deploy.

## Conventions

- Tags are **unprefixed** semver (`0.2.0`, not `v0.2.0`), since git-flow creates them.
- Follow [Keep a Changelog](https://keepachangelog.com): add notable changes
  under `## [Unreleased]` as you go; the release script dates and versions them.
- [Semantic Versioning](https://semver.org): new features → minor, fixes → patch.
