// Release helper: bump package.json, roll the CHANGELOG's [Unreleased] section
// into a dated version, re-stamp version.json, and commit. Designed to run
// inside a git-flow release/hotfix branch; the tag itself is created by
// `git flow release finish <version>`.
//
// Usage (inside `git flow release start 0.2.0`):
//   bun run release                 # infers 0.2.0 from the branch name
//   bun run release -- minor        # or bump major|minor|patch
//   bun run release -- 0.2.0        # or pin an explicit version
//   bun run release -- --dry-run    # preview without writing
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, pkgVersion, parseSemver } from "./version-utils.mjs";

const REPO = "https://github.com/meemur-dev/meemur.com";

function nextVersion(cur, spec) {
  if (parseSemver(spec)) return spec.replace(/^v/, "");
  const [maj, min, pat] = parseSemver(cur);
  if (spec === "major") return `${maj + 1}.0.0`;
  if (spec === "minor") return `${maj}.${min + 1}.0`;
  if (spec === "patch") return `${maj}.${min}.${pat + 1}`;
  throw new Error(`Unknown version spec: "${spec}" (use major|minor|patch or x.y.z)`);
}

function branchVersion() {
  try {
    const b = execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT }).toString().trim();
    const m = b.match(/^(?:release|hotfix)\/v?(\d+\.\d+\.\d+)$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// Move the [Unreleased] body into a new dated version section, leaving
// [Unreleased] empty, and refresh the link references at the bottom.
function rollChangelog(text, next, cur, date) {
  const heading = "## [Unreleased]";
  const i = text.indexOf(heading);
  if (i === -1) throw new Error("CHANGELOG.md has no '## [Unreleased]' section");

  const afterHeading = i + heading.length;
  const restIdx = text.indexOf("\n## [", afterHeading);
  const bodyEnd = restIdx === -1 ? text.length : restIdx;
  const body = text.slice(afterHeading, bodyEnd).trim();
  const rest = restIdx === -1 ? "" : text.slice(restIdx);

  if (!body) console.warn("⚠ [Unreleased] section is empty — releasing with no notes.");

  let out =
    text.slice(0, afterHeading) +
    `\n\n## [${next}] - ${date}\n\n` +
    (body ? `${body}\n` : "") +
    rest;

  out = out.replace(
    /^\[Unreleased\]:.*$/m,
    `[Unreleased]: ${REPO}/compare/${next}...HEAD\n[${next}]: ${REPO}/compare/${cur}...${next}`,
  );
  return out;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const spec = args.find((a) => !a.startsWith("--")) ?? branchVersion();

if (!spec) {
  console.error(
    "No version given and not on a release/hotfix branch.\n" +
      "  Usage: bun run release -- <major|minor|patch|x.y.z>",
  );
  process.exit(1);
}

const cur = pkgVersion();
const next = nextVersion(cur, spec);
const date = new Date().toISOString().slice(0, 10);

console.log(`Release: ${cur} → ${next} (${date})`);

if (dryRun) {
  console.log("--dry-run: no files written.");
  process.exit(0);
}

// 1. package.json (regex keeps formatting intact)
const pkgPath = join(ROOT, "package.json");
writeFileSync(
  pkgPath,
  readFileSync(pkgPath, "utf8").replace(/("version":\s*")[^"]+(")/, `$1${next}$2`),
);

// 2. CHANGELOG
const clPath = join(ROOT, "CHANGELOG.md");
writeFileSync(clPath, rollChangelog(readFileSync(clPath, "utf8"), next, cur, date));

// 3. Re-stamp version.json + <meta name="version">
execSync("node scripts/build-version.mjs", { cwd: ROOT, stdio: "inherit" });

// 4. Commit the bump (the tag is created by `git flow release finish`)
execSync("git add package.json CHANGELOG.md index.html", { cwd: ROOT });
execSync(`git commit -m "Release ${next}"`, { cwd: ROOT });

console.log(`\n✓ Committed "Release ${next}". Next:`);
console.log(`    git flow release finish ${next}    # merges to main + develop and tags ${next}`);
