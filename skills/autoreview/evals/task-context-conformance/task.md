# Autoreview Task Context Conformance

## Problem/Feature Description

A developer asks for autoreview on a merge request that claims to implement ticket `BILL-123`. The merge request description links a product spec with explicit acceptance criteria. Produce the review plan and exact helper command, including the context the reviewing model must receive.

Do not review the diff before reading the merge request, ticket, and spec. Do not assume that clean code proves the requested behavior was implemented.

## Output Specification

Produce `autoreview-context-plan.md` with:

- **Sources Read**: every authoritative source and any access blocker
- **Task Contract**: objective, acceptance criteria, and explicit non-goals
- **Review Command**: the exact autoreview invocation and supplied task context
- **Conformance Check**: what the reviewer must verify beyond code quality
- **Blocked Path**: what to do if a named source is unavailable or conflicts

## Input Files

=============== FILE: inputs/merge-request.md ===============
title: Prevent duplicate payment submission
base: main
ticket: BILL-123
spec: docs/specs/payment-idempotency.md
description: Disable repeat submission while the first payment request is pending.
=============== END FILE ===============

=============== FILE: inputs/ticket.md ===============
id: BILL-123
objective: A rapid repeated click must enqueue only one payment request.
acceptance_criteria:
  - The submit action is unavailable while the first request is pending.
  - A failed request restores the ability to retry.
non_goals:
  - Redesigning the payment state architecture.
=============== END FILE ===============

=============== FILE: inputs/spec.md ===============
# Payment idempotency

The client owns immediate duplicate-click prevention. The existing payment API and state architecture remain unchanged. Focused proof must cover both rapid repeated clicks and retry after failure.
=============== END FILE ===============

=============== FILE: inputs/git-state.txt ===============
branch: feature/payment-idempotency
status: clean
origin/main: 174b6ef
HEAD: 3a67d25
=============== END FILE ===============
