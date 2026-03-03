---
description: Review local changes for test coverage gaps and PRD alignment
---

# /looploop-review — Code Review Mode

Reviews uncommitted changes against test coverage and PRD requirements.
No nit-picking. Focuses on what matters: are changes tested and aligned with the PRD?

**Goal: 100% test coverage on changed code.** Every changed code path should have a corresponding test. Gaps are flagged and can be auto-fixed.

The user is experienced. Be direct. Respect the prompt.

## Phase 1: ANALYZE

1. Run `git diff HEAD` and `git diff --staged` to collect all local changes.
   If both are empty → report "No local changes to review." and stop.

2. Extract the list of changed files from the diff output.

3. Check if `.looploop/prd.md` exists → set `has_prd` flag.

4. Auto-detect the project stack:
   - package.json → Node/TypeScript (check for vitest/jest/mocha)
   - pyproject.toml / setup.py → Python (check for pytest)
   - Cargo.toml → Rust (cargo test)
   - go.mod → Go (go test)

5. Create `.looploop/` directory if it doesn't exist.

6. Write `.looploop/progress.txt`:
   ```
   Phase: REVIEW
   Iteration: 0/0
   Status: Analyzing local changes
   ```

## Phase 2: REVIEW

7. Dispatch the **diff-reviewer** agent using the Agent tool:
   - Provide: the full git diff output, the list of changed files, `has_prd` flag, and PRD content (if it exists).
   - The agent analyzes test coverage and PRD alignment, then writes `.looploop/review-report.md`.

8. Read `.looploop/review-report.md` and present the report to the user.

## Phase 3: OFFER FIX

9. Parse the verdict from the report. Based on the result:

   - **PASS** → "All changes look good. Tests cover the diff and PRD alignment is fine."

   - **NEEDS TESTS** or **NEEDS BOTH** → Ask the user: "Test coverage gaps found — target is 100% coverage on changed code. Want me to write missing tests?"
     - If yes → dispatch the existing **coverage-guard** agent with the uncovered files and `.looploop/config.json`.
     - If no → acknowledge and move on.

   - **NEEDS REVIEW** or **NEEDS BOTH** → Present PRD alignment issues. Note: "These require human judgment — no auto-fix available."

10. Update `.looploop/progress.txt`:
    ```
    Phase: DONE
    Iteration: 0/0
    Status: Review complete
    ```
