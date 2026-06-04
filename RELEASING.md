# Releasing

Versioning is driven by **git-flow** + a small release script, with a guard test
that fails if anything drifts. `package.json` is the single source of truth;
git tags and `version.json` derive from it.

## Cut a release

```bash
git flow release start 0.2.0     # branch off develop (use the real next version)
npm run release                  # infers 0.2.0 from the branch name; bumps
                                 # package.json, rolls CHANGELOG [Unreleased]
                                 # → [0.2.0], re-stamps version.json, and commits
git flow release finish 0.2.0    # merges to main + develop and creates tag 0.2.0
git push origin main develop --tags
```

`npm run release` also accepts an explicit bump or version, and a preview:

```bash
npm run release -- minor     # or major | patch
npm run release -- 0.2.0     # pin a version
npm run release -- --dry-run # show the bump without writing
```

Hotfixes work the same way with `git flow hotfix start <x.y.z>`.

## What keeps it honest

- **`npm run check:version`** (and `tests/version.spec.mjs`, run by `npm test`)
  fail if `package.json` is behind the latest git tag, or if the CHANGELOG has no
  section for that tag. This is the check that would have caught `0.1.1`
  shipping while `package.json` still said `0.1.0`.
- **`scripts/build-version.mjs`** keeps `/version.json` and the page's
  `<meta name="version">` in sync with `package.json` on every build/deploy.

## Conventions

- Tags are **unprefixed** semver (`0.2.0`, not `v0.2.0`) — git-flow creates them.
- Follow [Keep a Changelog](https://keepachangelog.com): add notable changes
  under `## [Unreleased]` as you go; the release script dates and versions them.
- [Semantic Versioning](https://semver.org): new features → minor, fixes → patch.
