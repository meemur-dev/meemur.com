// CLI guard: fail (exit 1) when package.json / git tag / CHANGELOG drift apart.
// Run manually (`npm run check:version`) or in CI. The same check runs as a
// Playwright test (tests/version.spec.mjs) so a normal `npm test` catches it.
import { checkDrift } from "./version-utils.mjs";

const { pkg, tag, errors, skipped } = checkDrift();

if (skipped) {
  console.log(`version check skipped — ${skipped}`);
  process.exit(0);
}

if (errors.length) {
  console.error("✗ version drift detected:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ version ok — package.json ${pkg} is in sync with latest tag ${tag}`);
