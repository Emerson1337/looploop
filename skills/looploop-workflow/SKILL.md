---
name: looploop-workflow
description: XP pair-programming workflow with PRD-driven TDD and iterative implementation
---

# looploop Workflow

looploop is an XP pair-programming workflow for Claude Code that enforces structured, test-driven development.

## Two Modes

### Full Mode: `/looploop`
For new features and substantial work. Follows: **PRD → TDD → Implement → Iterate**

- Phase 0: Initialize — detect stack, gather requirements
- Phase 1: PRD — generate and auto-review a technical PRD
- Phase 2: TDD — write tests first (default: 2 iterations)
- Phase 3: Implementation — write code to pass tests (default: 3 iterations)
- Phase 4: Summary — final results and next steps

### Light Mode: `/looploop-fix`
For bugfixes, small features, and refactors. Follows: **Understand → Test Guard → Implement → Verify**

- Skips PRD generation entirely
- Establishes test baseline before any changes
- Writes missing tests for uncovered code
- Verifies no regressions after the fix

## Session State

All state is stored in `.looploop/` in the project root:
- `config.json` — session configuration
- `progress.txt` — current phase and iteration
- `prd.md` — the PRD (full mode only)
- `baseline.txt` — test baseline (light mode only)
- `snapshot-*.md` — iteration snapshots

## Other Commands

- `/looploop-status` — check current session progress
- `/looploop-resume` — resume an interrupted session

## When to Use Which Mode

Use **full mode** (`/looploop`) when:
- Building a new feature from scratch
- Major refactors that need a technical plan
- Work that benefits from explicit acceptance criteria

Use **light mode** (`/looploop-fix`) when:
- Fixing a bug
- Small feature additions
- Targeted refactors
- Any change where writing a PRD would be overkill
