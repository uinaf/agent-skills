import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

test("local and trusted remote skill gates use the same 100-point contract", () => {
  const packageJson = JSON.parse(readRepoFile("package.json")) as {
    scripts: Record<string, string>;
  };
  const reviewScript = readRepoFile("scripts/skills/review.sh");
  const publishWorkflow = readRepoFile(".github/workflows/publish-skills.yml");
  const pullRequestWorkflow = readRepoFile(".github/workflows/review-skills.yml");

  assert.equal(packageJson.scripts["review:skills"], "./scripts/skills/review.sh");
  assert.equal(
    packageJson.scripts["verify:skills"],
    "pnpm run verify && pnpm run review:skills",
  );
  assert.match(reviewScript, /threshold="\$\{TESSL_THRESHOLD:-100\}"/);
  assert.match(publishWorkflow, /TESSL_THRESHOLD: "100"/);
  assert.match(publishWorkflow, /run: pnpm run verify:skills/);
  assert.doesNotMatch(publishWorkflow, /run: \.\/scripts\/skills\/review\.sh/);
  assert.doesNotMatch(pullRequestWorkflow, /main-review:/);
  assert.doesNotMatch(pullRequestWorkflow, /^  push:/m);
});
