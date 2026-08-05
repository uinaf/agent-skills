# Skill Audit Without Tessl

## Problem/Feature Description

A team asks for a formal audit of its `incident-helper` skill. This checkout has
no Tessl wrapper, package dependency, executable, workspace configuration, or
authentication, and network access is disabled. Do not install or authenticate
anything. Complete the audit using the repository's available evidence and
state clearly which publication claim cannot be made without Tessl.

## Output Specification

Produce:

- `audit-report.md` — validation used, strengths, qualitative audit dimensions,
  prioritized findings with file and section evidence, the smallest recommended
  change set, and the remaining publication gap
- `audit-log.sh` — exact read-only commands run in execution order

Do not edit the supplied files.

## Input Files

=============== FILE: AGENTS.md ===============
# Skill Repository Rules

- Skill frontmatter contains only `name` and `description`.
- Local Markdown links are repo-relative and must resolve.
- Every workflow has an observable completion condition.
- Publication requires an authenticated Tessl score, but ordinary audits must
  still complete when Tessl is unavailable.
- Do not install tools or start authentication during an audit.

=============== FILE: skills/incident-helper/SKILL.md ===============
---
name: incident-helper
description: Helps with incidents.
owner: platform
---

# Incident Helper

Use this skill when incidents happen. Be thorough and helpful.

## Workflow

1. Investigate the incident.
2. Follow [the recovery guide](references/recovery.md).
3. Handle the problem.

Use the `/postmortem-writer` skill when finished.
