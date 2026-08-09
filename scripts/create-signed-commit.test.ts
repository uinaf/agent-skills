import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCommitInput,
  parseSignedCommitResponse,
} from "./create-signed-commit.ts";

test("buildCommitInput creates an optimistic multi-file GraphQL commit", () => {
  assert.deepEqual(
    buildCommitInput({
      branch: "main",
      expectedHeadOid: "abc123",
      files: [
        { contents: "Zmlyc3Q=", path: "skills/first/plugin.json" },
        { contents: "c2Vjb25k", path: "skills/second/plugin.json" },
      ],
      headline: "chore: sync versions [skip ci]",
      repository: "uinaf/skills",
    }),
    {
      branch: {
        branchName: "main",
        repositoryNameWithOwner: "uinaf/skills",
      },
      expectedHeadOid: "abc123",
      fileChanges: {
        additions: [
          { contents: "Zmlyc3Q=", path: "skills/first/plugin.json" },
          { contents: "c2Vjb25k", path: "skills/second/plugin.json" },
        ],
      },
      message: { headline: "chore: sync versions [skip ci]" },
    },
  );
});

test("parseSignedCommitResponse requires GitHub's verified signature", () => {
  const response = {
    data: {
      createCommitOnBranch: {
        commit: {
          author: { user: { login: "uinaf-releaser[bot]" } },
          oid: "abc123",
          signature: {
            isValid: true,
            signer: { login: "uinaf-releaser" },
            wasSignedByGitHub: true,
          },
          url: "https://github.com/uinaf/skills/commit/abc123",
        },
      },
    },
  };

  assert.deepEqual(parseSignedCommitResponse(response, "uinaf-releaser[bot]"), {
    author: "uinaf-releaser[bot]",
    oid: "abc123",
    signer: "uinaf-releaser",
    url: "https://github.com/uinaf/skills/commit/abc123",
  });

  response.data.createCommitOnBranch.commit.signature.wasSignedByGitHub = false;
  assert.throws(
    () => parseSignedCommitResponse(response, "uinaf-releaser[bot]"),
    /without a valid GitHub signature/,
  );

  response.data.createCommitOnBranch.commit.signature.wasSignedByGitHub = true;
  assert.throws(
    () => parseSignedCommitResponse(response, "another-app[bot]"),
    /expected another-app\[bot\]/,
  );
});
