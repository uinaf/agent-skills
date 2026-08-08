import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

test("local and trusted remote skill gates use the same 100-point contract", () => {
  const packageJson = JSON.parse(readRepoFile("package.json")) as {
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  };
  const reviewScript = readRepoFile("scripts/review.sh");
  const optimizeScript = readRepoFile("scripts/optimize.sh");
  const publishScript = readRepoFile("scripts/publish.sh");
  const publishWorkflow = readRepoFile(".github/workflows/publish-skills.yml");
  const pullRequestWorkflow = readRepoFile(".github/workflows/review-skills.yml");
  const deprecatedCliOverride = ["TESSL", "CLI", "VERSION"].join("_");
  const tesslVersion = packageJson.devDependencies.tessl;

  assert.equal(packageJson.scripts["review:skills"], "./scripts/review.sh");
  assert.ok(tesslVersion);
  assert.match(tesslVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(
    packageJson.scripts["verify:skills"],
    "pnpm run verify && pnpm run review:skills",
  );
  assert.match(reviewScript, /threshold="\$\{TESSL_THRESHOLD:-100\}"/);
  assert.match(
    reviewScript,
    /\.tessl-plugin\/plugin\.json/,
    "review.sh must skip directories that are not Tessl plugins",
  );
  for (const script of [reviewScript, optimizeScript, publishScript]) {
    assert.match(script, /pnpm exec tessl/);
    assert.doesNotMatch(script, new RegExp(`${deprecatedCliOverride}|pnpm dlx`));
  }
  assert.match(publishWorkflow, /TESSL_THRESHOLD: "100"/);
  assert.match(publishWorkflow, /run: pnpm run verify:skills/);
  assert.doesNotMatch(publishWorkflow, /run: \.\/scripts\/review\.sh/);
  assert.doesNotMatch(publishWorkflow, /tesslio\/setup-tessl|id-token: write/);
  assert.match(publishWorkflow, /TESSL_TOKEN: \$\{\{ secrets\.TESSL_TOKEN \}\}/);
  assert.doesNotMatch(pullRequestWorkflow, /main-review:/);
  assert.doesNotMatch(pullRequestWorkflow, /^  push:/m);
});
