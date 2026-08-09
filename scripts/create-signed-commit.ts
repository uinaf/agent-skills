import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type CommitFile = {
  contents: string;
  path: string;
};

type CommitRequest = {
  branch: string;
  expectedHeadOid: string;
  files: CommitFile[];
  headline: string;
  repository: string;
};

type SignedCommit = {
  author: string;
  oid: string;
  signer: string;
  url: string;
};

export function buildCommitInput(request: CommitRequest): object {
  return {
    branch: {
      repositoryNameWithOwner: request.repository,
      branchName: request.branch,
    },
    expectedHeadOid: request.expectedHeadOid,
    fileChanges: {
      additions: request.files,
    },
    message: {
      headline: request.headline,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSignedCommitResponse(
  value: unknown,
  expectedAuthor: string,
): SignedCommit {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new Error("GitHub returned an invalid GraphQL response");
  }

  const mutation = value.data.createCommitOnBranch;
  if (!isRecord(mutation) || !isRecord(mutation.commit)) {
    throw new Error("GitHub did not create the commit");
  }

  const commit = mutation.commit;
  const author = commit.author;
  const signature = commit.signature;
  if (
    typeof commit.oid !== "string" ||
    typeof commit.url !== "string" ||
    !isRecord(author) ||
    !isRecord(author.user) ||
    typeof author.user.login !== "string"
  ) {
    throw new Error("GitHub created a commit without an authenticated author");
  }
  if (author.user.login !== expectedAuthor) {
    throw new Error(
      `GitHub created the commit as ${author.user.login}; expected ${expectedAuthor}`,
    );
  }
  if (
    !isRecord(signature) ||
    signature.isValid !== true ||
    signature.wasSignedByGitHub !== true ||
    !isRecord(signature.signer) ||
    typeof signature.signer.login !== "string"
  ) {
    throw new Error("GitHub created a commit without a valid GitHub signature");
  }

  return {
    author: expectedAuthor,
    oid: commit.oid,
    signer: signature.signer.login,
    url: commit.url,
  };
}

function gitOutput(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" });
}

function nulSeparated(value: string): string[] {
  return value.split("\0").filter(Boolean);
}

function collectChangedFiles(scopes: string[]): CommitFile[] {
  const unsupported = nulSeparated(
    gitOutput([
      "diff",
      "--name-only",
      "-z",
      "--diff-filter=DRTUXB",
      "HEAD",
      "--",
      ...scopes,
    ]),
  );
  const untracked = nulSeparated(
    gitOutput(["ls-files", "--others", "--exclude-standard", "-z", "--", ...scopes]),
  );

  if (unsupported.length > 0 || untracked.length > 0) {
    throw new Error(
      `signed writeback only supports tracked file additions or modifications: ${[
        ...unsupported,
        ...untracked,
      ].join(", ")}`,
    );
  }

  return nulSeparated(
    gitOutput([
      "diff",
      "--name-only",
      "-z",
      "--diff-filter=AM",
      "HEAD",
      "--",
      ...scopes,
    ]),
  ).map((path) => ({
    contents: readFileSync(path).toString("base64"),
    path,
  }));
}

async function main(): Promise<void> {
  const [headline, ...scopes] = process.argv.slice(2);
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_REF_NAME;
  const expectedAuthor = process.env.EXPECTED_COMMIT_AUTHOR;

  if (
    !headline ||
    scopes.length === 0 ||
    !repository ||
    !branch ||
    !expectedAuthor ||
    !process.env.GH_TOKEN
  ) {
    throw new Error(
      "usage: create-signed-commit <headline> <scope...>; GITHUB_REPOSITORY, GITHUB_REF_NAME, EXPECTED_COMMIT_AUTHOR, and GH_TOKEN are required",
    );
  }

  const files = collectChangedFiles(scopes);
  if (files.length === 0) {
    console.log("No files changed; skipping signed commit");
    return;
  }

  const query = `
    mutation($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          author { user { login } }
          oid
          url
          signature {
            isValid
            signer { login }
            wasSignedByGitHub
          }
        }
      }
    }
  `;
  const input = buildCommitInput({
    branch,
    expectedHeadOid: gitOutput(["rev-parse", "HEAD"]).trim(),
    files,
    headline,
    repository,
  });
  const response = execFileSync("gh", ["api", "graphql", "--input", "-"], {
    encoding: "utf8",
    input: JSON.stringify({ query, variables: { input } }),
  });
  const commit = parseSignedCommitResponse(
    JSON.parse(response) as unknown,
    expectedAuthor,
  );

  console.log(
    `Created verified commit ${commit.oid} by ${commit.author}, signed by ${commit.signer}: ${commit.url}`,
  );
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(resolve(invokedPath)).href) {
  await main();
}
