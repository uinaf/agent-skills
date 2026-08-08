---
name: react-ban-use-effect
description: "Detect, replace, and lint-ban direct `useEffect` in React components and hooks. Prefer declarative replacements for derived state, fetching, event reactions, resets, and external sync; add ESLint or agent rules for a no-direct-useEffect policy. Use when writing, refactoring, reviewing, or migrating React code that imports or calls `useEffect`, or when an agent reaches for an effect by default. Do not use for ordinary React work with no effect smell, non-React code, or legitimate effect architecture outside React."
---

# React Ban useEffect

Default stance: do not import or call `useEffect` directly in React components.
Treat effects as an escape hatch for synchronizing with external systems.

## Start Here

1. Search the touched React surface for direct `useEffect` imports and calls.
2. Classify each effect by intent before editing:
   - render-time derivation
   - data fetching or server state
   - response to a user action
   - local state reset on identity change
   - async UI, pending state, or request waterfall
   - external-system synchronization
3. Replace it with the narrowest declarative pattern from [references/replacements.md](references/replacements.md).
4. For data, forms, external stores, or performance work, also check [references/alternatives.md](references/alternatives.md).
5. Prove the change: run the repo's lint/type/test gate, optional `react-doctor`
   CLI diff scan when available, plus the smallest runtime check for the changed
   path. Fix failures and rerun before completion.

## Replacement Ladder

Highest applicable layer wins. Intent → layer:

| Intent | Prefer |
| --- | --- |
| derive from props/state | render-time calculation |
| fetch / server state | server, loader, or TanStack Query / SWR / Relay / Apollo |
| user action | event handler, form action, or mutation |
| reset on identity change | keyed component boundary |
| read external store | `useSyncExternalStore` |
| other external sync | reviewed domain-specific hook |

1. render-time calculation
2. server, loader, or framework data API
3. server-state library such as TanStack Query, SWR, Relay, or Apollo
4. event handler, form action, or mutation
5. keyed component boundary
6. `useSyncExternalStore` or a reviewed domain-specific external-system hook

Common keyed reset:

```tsx
function ProfilePage({ userId }: { userId: string }) {
  return <Profile key={userId} userId={userId} />;
}
```

If none fit, stop and explain why the code truly needs an effect instead of
adding direct `useEffect`.

## Allowed Escape Hatches

Prefer an existing repo integration hook. Otherwise add a domain-specific hook
that names the external system, owns setup/cleanup, and lists every reactive
input in the dependency array. See
[the external-system replacement](references/replacements.md#5-synchronize-external-systems).

Do not expose a generic effect callback or dependency list to callers.
Do not suppress `react-hooks/exhaustive-deps`.
A mount-only empty dependency list is allowed only when setup reads no reactive
props, state, or closure values.
Prefer `useSyncExternalStore` for stores or browser values that change over time.
Never use an exception hook to fetch server state, copy props into state, or
relay user actions.

## Enforcement

Prefer the repo's existing ESLint shape. Usual rules: `no-restricted-imports`
against `useEffect` from `react`, plus `no-restricted-syntax` (or a custom rule)
for `React.useEffect(...)`. Allow only named, reviewed external-integration hook
files as exceptions. Preserve any existing local lint convention.

```ts
{
  "no-restricted-imports": ["error", {
    name: "react",
    importNames: ["useEffect"],
    message: "Use a declarative replacement or reviewed external-integration hook.",
  }],
  "no-restricted-syntax": ["error", {
    selector: "CallExpression[callee.object.name='React'][callee.property.name='useEffect']",
    message: "Do not call React.useEffect directly.",
  }],
}
```

In reviews, treat new direct `useEffect` as a finding unless the diff also adds
a clear, reviewed exception. Ask for a replacement plan, not dependency-array
tuning. Provenance notes: [references/upstream.md](references/upstream.md).

## Boundaries

- Scope the change to the touched path or requested migration slice.
- Preserve the repo's existing data, lint, hook, and framework conventions.
- Leave `useLayoutEffect`, framework lifecycle APIs, and non-React effect systems alone unless requested.
- Use performance primitives only for real UI/perf evidence or established repo patterns.

## Sources

Core sources and the broader alternatives bibliography live in [references/alternatives.md](references/alternatives.md).
