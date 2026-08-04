# Preserve the Working Homebrew Tap Pattern

## Problem/Feature Description

The `tccutil` repo publishes a small non-Go CLI and needs its release workflow fixed so new GitHub releases update `uinaf/homebrew-tap` automatically. A previous attempt used `dawidd6/action-homebrew-bump-formula`, but the action tried to follow a fork/PR path and failed with the existing token shape.

The organization already has a known-good sibling repo, `uinaf/healthd`, with an App-backed Homebrew update that successfully pushes directly to the same style of tap using the v3 line of `Justintime50/homebrew-releaser`, pinned to a full commit SHA, with a short-lived `uinaf-releaser` installation token. The desired fix is to copy that boring working pattern, not invent an inline clone/sed/push script and not swap in another Homebrew action.

## Output Specification

Update `.github/workflows/release.yml` for `tccutil` so the release job updates the Homebrew tap after a release is published.

Also write a short `SETUP.md` note documenting the `UINAF_RELEASE_APP_CLIENT_ID` / `UINAF_RELEASE_APP_PRIVATE_KEY` Environment credentials and that the minted token must be Contents-scoped to the source repo and `homebrew-tap`.

## Input Files

The following files represent the current repository state. Extract them before beginning.

=============== FILE: .github/workflows/release.yml ===============
name: release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@<full-sha> # v6.0.2
        with:
          fetch-depth: 0
      - uses: cycjimmy/semantic-release-action@<full-sha> # v4.2.2
        id: release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Bump Homebrew formula
        if: steps.release.outputs.new_release_published == 'true'
        uses: dawidd6/action-homebrew-bump-formula@<full-sha> # v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          tap: uinaf/homebrew-tap
          formula: tccutil
          tag: v${{ steps.release.outputs.new_release_version }}
=============== END FILE ===============

=============== FILE: docs/healthd-update-homebrew-tap.yml ===============
update-homebrew-tap:
  needs: release
  if: needs.release.outputs.new_release_published == 'true'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/create-github-app-token@<full-sha> # v3.2.0
      id: release-bot
      with:
        client-id: ${{ vars.UINAF_RELEASE_APP_CLIENT_ID }}
        private-key: ${{ secrets.UINAF_RELEASE_APP_PRIVATE_KEY }}
        owner: uinaf
        repositories: |
          healthd
          homebrew-tap
        permission-contents: write
    - id: release-bot-identity
      env:
        GH_TOKEN: ${{ steps.release-bot.outputs.token }}
        APP_SLUG: ${{ steps.release-bot.outputs.app-slug }}
      run: |
        set -euo pipefail
        user_id="$(gh api "/users/${APP_SLUG}[bot]" --jq .id)"
        if [[ ! "$user_id" =~ ^[0-9]+$ ]]; then
          echo "failed to resolve numeric bot user id for ${APP_SLUG}[bot]" >&2
          exit 1
        fi
        echo "user-id=${user_id}" >> "$GITHUB_OUTPUT"
    - uses: Justintime50/homebrew-releaser@<full-sha> # v3.3.0
      with:
        homebrew_owner: uinaf
        homebrew_tap: homebrew-tap
        formula_folder: Formula
        github_token: ${{ steps.release-bot.outputs.token }}
        commit_owner: ${{ steps.release-bot.outputs.app-slug }}[bot]
        commit_email: ${{ steps.release-bot-identity.outputs.user-id }}+${{ steps.release-bot.outputs.app-slug }}[bot]@users.noreply.github.com
        install: 'bin.install "healthd"'
        test: 'system "#{bin}/healthd", "--version"'
=============== END FILE ===============
