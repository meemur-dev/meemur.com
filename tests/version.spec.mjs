import { test, expect } from "@playwright/test";
import { checkDrift } from "../scripts/version-utils.mjs";

// Release guard: package.json must not lag behind the latest git tag, and that
// tag must be documented in the CHANGELOG. This is the check that would have
// caught 0.1.1 shipping while package.json still said 0.1.0. Pure logic — it
// doesn't use the browser (but still runs once per viewport project).
test.describe("release versioning", () => {
  test("package.json, latest git tag, and CHANGELOG are in sync", () => {
    const { errors, skipped } = checkDrift();
    test.skip(!!skipped, `version check skipped: ${skipped}`);
    expect(errors, errors.join(" | ")).toEqual([]);
  });
});
