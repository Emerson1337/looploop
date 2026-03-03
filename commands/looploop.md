---
description: Start a PRD-driven development workflow with TDD and iterative implementation
---

# /looploop — PRD-Driven Development

You are starting a structured development workflow.
The user is an experienced developer. They define the skeleton — you place the organs.
This is XP pair programming. You are the driver. The user is the navigator.
Do NOT over-explain basics. Be direct, technical, and opinionated.

## Phase 0: Initialize

1. Create `.looploop/` directory in the project root if it doesn't exist.
   If it already exists, ask:
   "A looploop session already exists. Resume it or start fresh?"

2. Auto-detect the project stack by examining:
   - package.json → Node/TypeScript (check for vitest/jest/mocha)
   - pyproject.toml / setup.py → Python (check for pytest)
   - Cargo.toml → Rust (cargo test)
   - go.mod → Go (go test)
   - If ambiguous, ask the user.

3. Ask the user these questions (wait for answers):

   **Required:**
   - What do you want to build? (use their original prompt if provided as $ARGUMENTS)
   - Is this a new feature, a refactor, or a bugfix?

   **Test config:**
   - Tests are ON by default (unit + integration). Only ask:
     "Unit + integration tests. Want to add e2e?" (default: no)
   - Iterations: TDD phase (default: 2), Implementation phase (default: 3)

4. Write `.looploop/config.json` with all gathered info:
   ```json
   {
     "task": "<user's task description>",
     "type": "feature|refactor|bugfix",
     "stack": "<detected>",
     "test_runner": "<detected>",
     "test_dir": "<detected>",
     "tdd_iterations": 2,
     "impl_iterations": 3,
     "tests": { "unit": true, "integration": true, "e2e": false },
     "created_at": "<ISO timestamp>"
   }
   ```

5. Initialize `.looploop/progress.txt`:
   ```
   Phase: PRD
   Iteration: 0/0
   Status: Starting PRD generation
   ```

## Phase 1: PRD Generation

6. Dispatch the **prd-architect** agent using the Agent tool:
   - Provide the task description and point it to `.looploop/config.json`
   - The agent writes `.looploop/prd.md`

7. Dispatch the **prd-reviewer** agent using the Agent tool:
   - Point it to `.looploop/prd.md` and `.looploop/config.json`
   - The reviewer rewrites `.looploop/prd.md` with refinements in-place

8. Present a brief summary of the PRD to the user. Ask:
   "PRD ready. Proceed to TDD phase, or want to review/edit first?"

## Phase 2: TDD

9. Update `.looploop/progress.txt`:
   ```
   Phase: TDD
   Iteration: 0/{tdd_iterations}
   ```

10. Dispatch the **test-writer** agent using the Agent tool:
    - Input: `.looploop/prd.md` + `.looploop/config.json`
    - It writes test files, runs them (expects failures), saves snapshot
    - It updates `.looploop/progress.txt` with iteration progress

11. The stop hook (`check-iteration.mjs`) handles the iteration loop automatically.
    When iterations are exhausted, execution continues to Phase 3.

## Phase 3: Implementation

12. Update `.looploop/progress.txt`:
    ```
    Phase: IMPL
    Iteration: 0/{impl_iterations}
    ```

13. Dispatch the **implementer** agent using the Agent tool:
    - Input: `.looploop/prd.md` + test files + `.looploop/config.json`
    - It implements code to pass tests, runs tests, saves snapshot
    - It updates `.looploop/progress.txt` with iteration progress

14. The stop hook handles iteration loop automatically.

## Phase 4: Summary

15. Read final `.looploop/progress.txt` and the latest snapshot.
16. Present to the user:
    - Total tests passing/failing
    - What was implemented (files created/modified)
    - What remains (if any failing tests)
    - Suggested next steps
17. Clean up: Keep `.looploop/` for reference but note the session is complete.
