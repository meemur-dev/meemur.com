// Generate /version.json with build info, and keep <meta name="version"> in
// sync with package.json. Runs locally (predev/pretest) and as the Cloudflare
// Pages build command — there, CF_PAGES_* env vars provide the deployed commit,
// so the live /version.json always reflects the exact build.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

function localCommit() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
  } catch {
    return "dev";
  }
}

const commit = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 8) ?? localCommit();
const branch = process.env.CF_PAGES_BRANCH ?? "local";

writeFileSync(
  join(ROOT, "public/version.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      commit,
      branch,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);

// Keep the page's <meta name="version"> aligned with the semver (no-op when
// unchanged, so it never creates spurious git diffs).
const indexPath = join(ROOT, "public/index.html");
const html = readFileSync(indexPath, "utf8");
writeFileSync(
  indexPath,
  html.replace(/(<meta name="version" content=")[^"]*(")/, `$1${pkg.version}$2`),
);

console.log(`version.json → ${pkg.version} @ ${commit} (${branch})`);
