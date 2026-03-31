---
name: spec-creator
description: Creates and updates feature specifications under spec/features following LobsterAI conventions (spec.md, design docs, checklists, research). Use when writing a new spec, design doc, feature brief, or when the user mentions spec/, features/, or planning a feature before implementation.
---

# Spec Creator (LobsterAI)

## Command vs skill

- **Slash command**: `.cursor/commands/spec-creator.md` — user runs **`/spec-creator`** in chat for an explicit, repeatable “write the spec files now” flow. Prefer this when onboarding others or when you want the agent to prioritize file output.
- **This skill**: Same conventions; the agent should still follow it when the user asks for a spec, design doc, or `spec/features/...` work without typing `/`. The command simply pins intent and points here.

## When to apply

- New feature or large change needs a written spec before coding.
- User asks for a design doc, requirements, or `spec/features/...` layout.
- Extending or splitting an existing feature folder.

## Location and naming

- **Root**: `spec/features/<feature-slug>/`
- **Slug**: lowercase, hyphen-separated, short and stable (e.g. `001-optimize-windows-startup`, `im-conversation-sync`).
- **Primary spec file** (full requirements): `spec.md` in that folder.
- **Dated design / one-off writeups** (optional): `YYYY-MM-DD-<short-topic>.md` (e.g. `2026-03-26-ask-user-question-plugin.md`).
- **Supporting files** (as needed):
  - `research.md` — investigation, benchmarks, options considered.
  - `plan.md` — implementation phases after spec is approved.
  - `tasks.md` — trackable work items.
  - `checklists/requirements.md` — spec quality checklist (see template below).

Prefer **one** canonical `spec.md` per feature for requirements; use additional markdown files for deep dives or dated decisions so `spec.md` stays the single entry point.

## `spec.md` structure (template)

Use this outline unless the user requests a lighter doc:

```markdown
# Feature Specification: <Title>

**Feature ID**: <feature-slug>
**Created**: <YYYY-MM-DD>
**Status**: Draft | In Progress | Done

## Problem Statement
What is wrong or missing today; who is affected; why it matters.

## User Scenarios & Testing
### Scenario N: <short name>
**Given** ...
**When** ...
**Then** ...
**And** ...

## Functional Requirements
### FR-1: <theme>
- **FR-1.1**: ...
- **FR-1.2**: ...

## Success Criteria
| Criterion | Target | Measurement Method |
|-----------|--------|--------------------|
| ... | ... | ... |

## Non-Goals / Out of Scope
What this feature explicitly does not do.

## Assumptions & Dependencies
External systems, product decisions, or constraints.

## Open Questions
Numbered or bulleted; resolve or move to design doc.
```

**Rules for `spec.md`:**

- Focus on **user-visible behavior**, measurable outcomes, and testable requirements.
- Avoid locking to specific libraries or file paths unless the requirement *is* interoperability with a named system.
- Number requirements (FR-x.x) so plans and tasks can reference them.

## Design-heavy features

If the doc is mostly architecture, sequence diagrams, and rejected alternatives (like plugin flow docs), you may use a **standalone design file** with a clear title and date, and keep `spec.md` for requirements-only or add a short "Summary" in `spec.md` pointing to the design file.

## Checklist: `checklists/requirements.md`

After drafting `spec.md`, add or update a checklist to validate quality before implementation:

```markdown
# Specification Quality Checklist: <Title>

**Purpose**: Validate specification completeness before planning
**Created**: <YYYY-MM-DD>
**Feature**: [spec.md](../spec.md)

## Content Quality
- [ ] No unnecessary implementation detail in the spec body
- [ ] Focused on user value and measurable outcomes
- [ ] Mandatory sections completed

## Requirement Completeness
- [ ] No unresolved [NEEDS CLARIFICATION] markers
- [ ] Requirements are testable
- [ ] Success criteria are measurable and technology-agnostic where possible
- [ ] Primary and edge scenarios covered
- [ ] Scope bounded; assumptions listed

## Feature Readiness
- [ ] Functional requirements map to scenarios or success criteria
- [ ] No blocking ambiguity for engineering to estimate

## Notes
Brief notes for reviewers.
```

## Workflow for the agent

1. Confirm or propose **feature slug** and folder path under `spec/features/`.
2. Write or update **`spec.md`** using the template; align terminology with existing specs in the repo.
3. Add **`checklists/requirements.md`** when the spec is meant for formal review.
4. Add **`research.md`** if the user needs options comparison or data; **`plan.md`/`tasks.md`** when moving from spec to execution.
5. Do not edit unrelated specs; keep each change scoped to the feature folder.

## Reference examples in this repo

- Structured `spec.md` + checklist: `spec/features/001-optimize-windows-startup/`
- Design-oriented dated doc: `spec/features/ask-user-question-plugin/2026-03-26-ask-user-question-plugin.md`
- Large cross-cutting design: `spec/features/im-conversation-sync/2026-03-19-im-conversation-sync-design.md`

Read the closest matching example before writing a new doc so tone and section depth stay consistent.
