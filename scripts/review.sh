#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

threshold="${TESSL_THRESHOLD:-100}"
workspace="${TESSL_WORKSPACE:-uinaf}"
review_all="${TESSL_REVIEW_ALL:-false}"
args=()
use_lint=false

if [[ "${TESSL_REVIEW_MODE:-}" == "lint" ]]; then
  use_lint=true
elif [[ -n "${CI:-}" && -z "${TESSL_TOKEN:-}" ]]; then
  use_lint=true
fi

has_threshold=false
has_json=false
has_workspace=false
explicit_skill_dirs=false
declare -a skill_dirs=()

for arg in "$@"; do
  if [[ "$arg" == "--threshold" ]] || [[ "$arg" == --threshold=* ]]; then
    has_threshold=true
    args+=("$arg")
    continue
  fi
  if [[ "$arg" == "--json" ]]; then
    has_json=true
    args+=("$arg")
    continue
  fi
  if [[ "$arg" == "--workspace" ]] || [[ "$arg" == -w ]] || [[ "$arg" == --workspace=* ]]; then
    has_workspace=true
    args+=("$arg")
    continue
  fi
  if [[ "$arg" == skills/* ]] || [[ "$arg" == ./skills/* ]]; then
    explicit_skill_dirs=true
    skill_dirs+=("${arg#./}")
    continue
  fi
  args+=("$arg")
done

if [[ "$has_json" == true ]]; then
  echo "batch review does not support --json; run pnpm exec tessl review run --json skills/<name> per skill"
  exit 1
fi

if [[ "$use_lint" == false && "$has_workspace" == false ]]; then
  args+=(--workspace "$workspace")
fi

if [[ "$use_lint" == false && "$has_threshold" == false ]]; then
  args+=(--threshold "$threshold")
fi

collect_changed_skill_dirs() {
  local before="$1"
  local after="$2"
  if [[ "$before" =~ ^0+$ ]]; then
    find skills -mindepth 1 -maxdepth 1 -type d | sort
    return
  fi
  git diff --name-only "$before" "$after" -- skills |
    awk -F/ 'NF >= 2 { print $1 "/" $2 }' |
    sort -u
}

if [[ "${#skill_dirs[@]}" -eq 0 ]]; then
  if [[ "$use_lint" == true || "$review_all" == "true" ]]; then
    while IFS= read -r dir; do
      skill_dirs+=("$dir")
    done < <(find skills -mindepth 1 -maxdepth 1 -type d | sort)
  elif [[ -n "${GITHUB_EVENT_BEFORE:-}" && -n "${GITHUB_SHA:-}" ]]; then
    while IFS= read -r dir; do
      [[ -n "$dir" ]] || continue
      skill_dirs+=("$dir")
    done < <(collect_changed_skill_dirs "$GITHUB_EVENT_BEFORE" "$GITHUB_SHA")
  elif git rev-parse --verify --quiet origin/main >/dev/null; then
    while IFS= read -r dir; do
      [[ -n "$dir" ]] || continue
      skill_dirs+=("$dir")
    done < <(collect_changed_skill_dirs "origin/main" "HEAD")
  else
    while IFS= read -r dir; do
      skill_dirs+=("$dir")
    done < <(find skills -mindepth 1 -maxdepth 1 -type d | sort)
  fi
fi

if [[ "$use_lint" == true && "${TESSL_REVIEW_MODE:-}" == "lint" ]]; then
  echo "Running tessl plugin lint because TESSL_REVIEW_MODE=lint."
elif [[ "$use_lint" == true ]]; then
  echo "Tessl review requires authentication in CI; running tessl plugin lint instead."
elif [[ "$explicit_skill_dirs" == true ]]; then
  echo "Running authenticated Tessl review for specified skills (threshold ${threshold})."
elif [[ "$review_all" == "true" ]]; then
  echo "Running authenticated Tessl review for the full skill portfolio (TESSL_REVIEW_ALL=true)."
else
  echo "Running authenticated Tessl review for changed skills only (threshold ${threshold})."
fi

if [[ "${#skill_dirs[@]}" -eq 0 ]]; then
  if [[ "$use_lint" == true ]]; then
    echo "No skill packages to lint."
  else
    echo "No skill packages to review."
  fi
  exit 0
fi

reviewed_any=false
for skill_dir in "${skill_dirs[@]}"; do
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi
  if [[ ! -f "$skill_dir/.tessl-plugin/plugin.json" ]]; then
    echo "Skipping $skill_dir: missing .tessl-plugin/plugin.json"
    continue
  fi

  echo "== tessl plugin lint: ${skill_dir#skills/} =="
  pnpm exec tessl plugin lint "$skill_dir"

  if [[ "$use_lint" == true ]]; then
    reviewed_any=true
    continue
  fi

  echo "== tessl review: ${skill_dir#skills/} =="
  pnpm exec tessl review run "${args[@]}" "$skill_dir"
  reviewed_any=true
done

if [[ "$reviewed_any" == false ]]; then
  echo "No Tessl plugin packages matched."
  exit 0
fi
