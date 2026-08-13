import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function workflowStep(workflow: string, name: string): string {
  const marker = `      - name: ${name}`;
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `missing workflow step: ${name}`);
  const next = workflow.indexOf("\n      - name:", start + marker.length);
  return workflow.slice(start, next === -1 ? undefined : next);
}

test("CI uses free lint verify; authenticated 100-point review stays local", () => {
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
    /TESSL_REVIEW_ALL/,
    "review.sh must support an intentional full-portfolio review",
  );
  assert.match(
    reviewScript,
    /GITHUB_EVENT_BEFORE/,
    "review.sh must scope authenticated review to changed skills when used",
  );
  assert.match(
    reviewScript,
    /\.tessl-plugin\/plugin\.json/,
    "review.sh must skip directories that are not Tessl plugins",
  );
  for (const script of [reviewScript, optimizeScript, publishScript]) {
    assert.match(script, /pnpm exec tessl/);
    assert.doesNotMatch(script, new RegExp(`${deprecatedCliOverride}|pnpm dlx`));
  }
  assert.match(publishWorkflow, /name: Verify skills/);
  assert.match(publishWorkflow, /run: pnpm run verify\n/);
  assert.doesNotMatch(publishWorkflow, /run: pnpm run verify:skills/);
  assert.doesNotMatch(publishWorkflow, /TESSL_THRESHOLD:/);
  assert.doesNotMatch(publishWorkflow, /TESSL_REVIEW_ALL:/);
  // publish job still needs the token for registry publish
  assert.match(publishWorkflow, /TESSL_TOKEN: \$\{[{] secrets\.TESSL_TOKEN [}]\}/);
  assert.doesNotMatch(publishWorkflow, /run: \.\/scripts\/review\.sh/);
  assert.doesNotMatch(publishWorkflow, /tesslio\/setup-tessl|id-token: write/);
  assert.match(
    publishWorkflow,
    /grafana\/github-api-commit-action@b1d81091e8480dd11fcea8bc1f0ab977a0376ca5/,
  );
  const failureAwareWriteback =
    /if: \$\{\{ !cancelled\(\) && \(steps\.publish\.outcome == 'success' \|\| steps\.publish\.outcome == 'failure'\) && github\.event_name == 'push' && github\.ref == 'refs\/heads\/main' \}\}/;
  assert.match(
    workflowStep(publishWorkflow, "Publish changed plugins"),
    /\n        id: publish\n/,
    "writeback conditions require the publish step outcome",
  );
  assert.match(
    workflowStep(publishWorkflow, "Stage published plugin versions"),
    failureAwareWriteback,
    "published versions must be staged after a partial publish failure",
  );
  assert.match(
    workflowStep(publishWorkflow, "Commit published plugin versions"),
    failureAwareWriteback,
    "published versions must be committed after a partial publish failure",
  );
  assert.doesNotMatch(
    publishWorkflow,
    /git commit|git push|release-bot-identity/,
  );
  assert.match(pullRequestWorkflow, /run: pnpm run verify\n/);
  assert.doesNotMatch(pullRequestWorkflow, /main-review:/);
  assert.doesNotMatch(pullRequestWorkflow, /^  push:/m);

  const monthlyLintWorkflow = readRepoFile(".github/workflows/monthly-lint.yml");
  assert.match(monthlyLintWorkflow, /schedule:/);
  assert.match(monthlyLintWorkflow, /run: pnpm run verify\n/);
  assert.doesNotMatch(monthlyLintWorkflow, /secrets\.TESSL_TOKEN|verify:skills|review\.sh|review-mode:\s*review/);
});
