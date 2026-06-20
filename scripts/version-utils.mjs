// Shared versioning helpers used by the release script and the drift guard.
// Single source of truth = package.json "version"; git tags are derived from it
// (created by `git flow release/hotfix finish`). These helpers detect when those
// fall out of sync, the failure mode that let 0.1.1 ship with package.json
// still at 0.1.0.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function pkgVersion() {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
}

// Parse "x.y.z" (tolerating a leading "v") into [major, minor, patch] numbers.
export function parseSemver(v) {
  const m = String(v).trim().replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

// Negative if a < b, 0 if equal, positive if a > b.
export function cmpSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

// Highest semver tag, or null if the repo has none (e.g. a shallow CI clone).
export function latestTag() {
  try {
    const out = execSync("git tag --list --sort=-v:refname", { cwd: ROOT }).toString();
    const tags = out.split("\n").map((t) => t.trim()).filter((t) => parseSemver(t));
    return tags[0] ?? null;
  } catch {
    return null;
  }
}

export function changelogHasVersion(v) {
  const text = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
  return new RegExp(`^##\\s*\\[${v.replace(/\./g, "\\.")}\\]`, "m").test(text);
}

// Returns { pkg, tag, errors[], skipped? }. `errors` is empty when in sync.
export function checkDrift() {
  const pkg = pkgVersion();
  const tag = latestTag();
  if (!tag) return { pkg, tag: null, errors: [], skipped: "no git tags found" };

  const errors = [];
  if (cmpSemver(pkg, tag) < 0) {
    errors.push(
      `package.json version (${pkg}) is behind the latest release tag (${tag}). ` +
        `Bump it during the release branch with \`bun run release\`.`,
    );
  }
  if (!changelogHasVersion(tag)) {
    errors.push(`CHANGELOG.md has no "## [${tag}]" section for the latest release tag (${tag}).`);
  }
  return { pkg, tag, errors };
}
