# Create or update a feature spec (YuanAI)

You are running the **spec-creator** workflow. The user invoked this via slash command—produce concrete files under `spec/features/`, not only high-level advice.

## What to do

1. Read **`.cursor/skills/spec-creator/SKILL.md`** and follow its paths, templates, and workflow (single source of truth for section structure and examples).
2. If the user message includes a feature name, topic, or slug, use it; otherwise propose a **`feature-slug`** and confirm or proceed with a reasonable default.
3. Open or skim the **closest existing example** in `spec/features/` (see the skill’s “Reference examples”) so tone and depth match this repo.
4. Create or update only the relevant tree: typically `spec/features/<feature-slug>/spec.md`, and when appropriate `checklists/requirements.md`, `research.md`, `plan.md`, or a dated design `YYYY-MM-DD-*.md`.
5. Keep edits scoped to that feature folder unless the user asked to link or update cross-references elsewhere.

## Output

- Prefer **writing the actual markdown files** in the workspace over pasting long drafts in chat.
- After changes, give a **short summary**: paths created/changed and what remains open (e.g. open questions).
