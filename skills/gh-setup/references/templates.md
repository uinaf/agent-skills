# Collaboration Files

Use when introducing or aligning GitHub-facing templates and contributor
policy. First inspect a public `<owner>/.github` defaults repository: local
files override shared defaults, and shared files are not copied into clones or
release archives.

## Ownership

Use owner-level defaults only for policy true across every target repository.
`SECURITY.md`, `CONTRIBUTING.md`, and a compact pull-request template are often
shareable. Licenses remain repository-local. Add a code of conduct only when an
actual enforcement and contact owner exists. Shared issue templates are risky
because any repository-local issue configuration disables the shared set.

Changing or creating a public defaults repository is a public policy change;
obtain authorization first.

## Pull Requests and Issues

A useful pull-request template asks for plain sentences, not headings for
their own sake:

```md
<!--
Open with the problem this change solves, as the requester stated it,
then the solution, then exactly what ran to prove it. Name a risk only
when there is a real one. No implementation inventories.
-->
```

Title the way the repository titles merged work, outcome over mechanism.
Avoid ceremonial checklists and heading scaffolds; reviewers read
sentences, not section labels.

Create issue forms only when their fields improve triage. Common distinct
routes are bug, feature, and (only when supported) question. Vulnerabilities
always route to `SECURITY.md`, never a public issue form.

## Security and Contributing

`SECURITY.md` should say not to file public vulnerabilities, point to a private
route that works for the repository visibility, request affected surface,
impact, minimal reproduction, and mitigations, and avoid response promises the
maintainer cannot meet.

- Public repositories may use GitHub private vulnerability reporting only
  after the setting is enabled and verified.
- Private repositories route to an existing private maintainer channel; do not
  promise the public Security-tab workflow.

`CONTRIBUTING.md` owns setup, canonical validation, and branch/PR expectations.
Link deeper release or deploy runbooks instead of copying them into README,
templates, and agent guidance.

Repository descriptions and topics should help humans route the project using
its real purpose, artifact type, language or framework, and canonical public
URL. Never leak private client, organization, host, or adjacent-repo facts into
public metadata.
