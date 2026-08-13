#!/usr/bin/env bash
set -euo pipefail

owner="${UINAF_RADAR_OWNER:-uinaf}"
project_title="${UINAF_RADAR_TITLE:-radar}"

fail() {
  echo "uinaf-radar: $*" >&2
  exit 1
}

command -v gh >/dev/null 2>&1 || fail "gh is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"

gh api user --silent >/dev/null 2>&1 ||
  fail "GitHub authentication is unavailable; authenticate the intended identity without switching accounts silently"

project_list="$({
  gh project list --owner "$owner" --limit 100 --format json
} 2>/dev/null)" || fail "cannot list Projects for $owner; verify access and the project scope"

matches="$(jq --arg title "$project_title" '[.projects[] | select(.title == $title)]' <<<"$project_list")"
match_count="$(jq 'length' <<<"$matches")"

if [[ "$match_count" -ne 1 ]]; then
  fail "expected exactly one $owner/$project_title Project, found $match_count"
fi

project_number="$(jq -r '.[0].number' <<<"$matches")"

# GraphQL variables are literal here, not shell expansions.
# shellcheck disable=SC2016
query='query($owner:String!,$number:Int!,$endCursor:String) {
  organization(login:$owner) {
    projectV2(number:$number) {
      title
      number
      url
      public
      fields(first:50) {
        nodes {
          __typename
          ... on ProjectV2SingleSelectField {
            name
            options { name }
          }
        }
      }
      views(first:20) {
        nodes { name layout filter }
      }
      items(first:100,after:$endCursor) {
        nodes {
          id
          isArchived
          content {
            __typename
            ... on Issue {
              title
              url
              state
              updatedAt
              closedAt
              author { login }
              labels(first:20) { nodes { name } }
              repository { nameWithOwner }
            }
            ... on PullRequest {
              title
              url
              state
              updatedAt
              closedAt
              author { login }
              labels(first:20) { nodes { name } }
              repository { nameWithOwner }
            }
            ... on DraftIssue { title }
          }
          fieldValues(first:20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}'

pages="$({
  gh api graphql --paginate --slurp \
    -F owner="$owner" \
    -F number="$project_number" \
    -f query="$query"
} 2>/dev/null)" || fail "cannot read $owner/$project_title; verify access and the project scope"

jq --arg owner "$owner" '
  def normalize_filter:
    split(" ")
    | map(select(length > 0))
    | map(
        if startswith("label:") then
          (ltrimstr("label:") | split(",") | sort | "label:" + join(","))
        else . end
      )
    | sort
    | join(" ");
  def item_status:
    ([.fieldValues.nodes[]? | select(.field.name == "Status") | .name][0] // null);
  def item_row:
    {
      title: (.content.title // "Untitled item"),
      url: (.content.url // null),
      repository: (.content.repository.nameWithOwner // null),
      type: (.content.__typename // "Unknown"),
      state: (.content.state // null),
      status: item_status,
      author: (.content.author.login // null),
      labels: ([.content.labels.nodes[]?.name] | sort),
      updatedAt: (.content.closedAt // .content.updatedAt // null)
    };

  . as $pages
  | $pages[0].data.organization.projectV2 as $project
  | [$pages[].data.organization.projectV2.items.nodes[]] as $raw_items
  | [$raw_items[] | select(.isArchived == false) | item_row] as $items
  | [$project.fields.nodes[]
      | select(.__typename == "ProjectV2SingleSelectField" and .name == "Status")
      | [.options[].name]] as $status_fields
  | [$project.views.nodes[] | {name, layout, filter}] as $views
  | ["Inbox", "Next", "Now", "Blocked", "Done"] as $expected_statuses
  | {
      project: {
        owner: $owner,
        title: $project.title,
        number: $project.number,
        url: $project.url,
        private: ($project.public | not)
      },
      counts: {
        total: ($items | length),
        inbox: ([$items[] | select(.status == "Inbox")] | length),
        now: ([$items[] | select(.status == "Now")] | length),
        blocked: ([$items[] | select(.status == "Blocked")] | length),
        next: ([$items[] | select(.status == "Next")] | length),
        done: ([$items[] | select(.status == "Done")] | length)
      },
      now: ([$items[] | select(.status == "Now")] | sort_by(.title)),
      blocked: ([$items[] | select(.status == "Blocked")] | sort_by(.title)),
      next: ([$items[] | select(.status == "Next")] | sort_by(.title)),
      inbox: ([$items[] | select(.status == "Inbox")] | sort_by(.updatedAt) | reverse),
      maintenance: ([$items[]
        | select(.status != "Done")
        | select(
            ((.labels | map(ascii_downcase)) as $labels
              | any($labels[]; . == "dependencies" or . == "bug" or . == "ktlo" or . == "incident"))
            or ((.author // "") | ascii_downcase | contains("dependabot"))
          )]
        | sort_by(.updatedAt) | reverse),
      shipped: {
        scope: "tracked-done-items-last-60-days",
        items: ([$items[]
          | select(.status == "Done")
          | select((.updatedAt | fromdateiso8601?) >= (now - (60 * 86400)))]
          | sort_by(.updatedAt) | reverse | .[:5])
      },
      projectDrift: ([
        if $project.public then "Radar must remain private" else empty end,
        if ($status_fields | length) != 1 then
          "Expected exactly one Status field"
        elif ($status_fields[0] | sort) != ($expected_statuses | sort) then
          "Status options must be Inbox, Next, Now, Blocked, and Done"
        else empty end,
        if ([$views[] | select(.name == "Radar" and .layout == "BOARD_LAYOUT" and ((.filter | normalize_filter) == ("-status:Done -status:Inbox" | normalize_filter)))] | length) != 1 then
          "Radar board view is missing or misconfigured"
        else empty end,
        if ([$views[] | select(.name == "Shipped" and .layout == "TABLE_LAYOUT" and .filter == "status:Done")] | length) != 1 then
          "Shipped table view is missing or misconfigured"
        else empty end,
        if ([$views[] | select(.name == "Inbox" and .layout == "TABLE_LAYOUT" and .filter == "status:Inbox")] | length) != 1 then
          "Inbox table view is missing or misconfigured"
        else empty end,
        if ([$views[] | select(.name == "Maintenance" and .layout == "TABLE_LAYOUT" and ((.filter | normalize_filter) == ("label:dependencies,bug,ktlo,incident" | normalize_filter)))] | length) != 1 then
          "Maintenance table view is missing or misconfigured"
        else empty end,
        if ([$items[] | select(.status == "Now")] | length) > 3 then
          "Now exceeds the maximum of three outcomes"
        else empty end,
        if ([$items[] | select(.status == "Next")] | length) > 5 then
          "Next exceeds the soft cap of five outcomes"
        else empty end,
        ($items[]
          | .status as $status
          | select($status == null or (["Inbox", "Next", "Now", "Blocked", "Done"] | index($status) | not))
          | "Missing or invalid Status: \(.url // .title)"),
        ($items[]
          | select(.state == "CLOSED" and .status != "Done")
          | "Closed issue is not Done: \(.url // .title)"),
        ($items[]
          | select(.state == "OPEN" and .status == "Done")
          | "Open issue is marked Done: \(.url // .title)")
      ] | unique)
    }
' <<<"$pages"
