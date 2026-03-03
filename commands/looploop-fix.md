---
description: Targeted fix workflow with test guards — for bugfixes, small features, and refactors
---

# /looploop-fix — Light Mode

For bugfixes, small features, and refactors where a full PRD is overkill.
Enforces test discipline without the ceremony.

The user is experienced. Be direct. Respect the prompt. Ensure tests pass.

## Phase 1: UNDERSTAND

1. Parse the task from $ARGUMENTS. If no arguments provided, ask: "What needs fixing?"

2. Create `.looploop/` directory if it doesn't exist.

3. Auto-detect the project stack:
   - package.json → Node/TypeScript (check for vitest/jest/mocha)
   - pyproject.toml / setup.py → Python (check for pytest)
   - Cargo.toml → Rust (cargo test)
   - go.mod → Go (go test)

4. Analyze the task to identify affected files:
   - Search the codebase for relevant code (use Grep, Glob, Read)
   - Identify the files that will need changes
   - Identify the modules/functions involved

5. Write `.looploop/config.json`:
   ```json
   {
     "task": "<task description>",
     "type": "fix",
     "stack": "<detected>",
     "test_runner": "<detected>",
     "test_dir": "<detected>",
     "affected_files": ["<path1>", "<path2>"],
     "created_at": "<ISO timestamp>"
   }
   ```

6. Write `.looploop/progress.txt`:
   ```
   Phase: GUARD
   Iteration: 1/1
   Status: Establishing test baseline
   ```

## Phase 2: TEST GUARD

7. Dispatch the **coverage-guard** agent using the Agent tool:
   - Provide affected file paths and `.looploop/config.json`
   - The agent finds existing tests, runs them, establishes baseline
   - If NO tests exist for affected code, it writes baseline tests
   - Results saved to `.looploop/baseline.txt`

8. Review the baseline results. Report to user:
   - "Found X existing tests (Y passing, Z failing)"
   - OR "No tests found — coverage-guard wrote baseline tests"

## Phase 3: IMPLEMENT

9. Update `.looploop/progress.txt`:
   ```
   Phase: IMPL
   Iteration: 1/1
   Status: Implementing fix
   ```

10. Now implement the fix yourself (do NOT dispatch an agent — light mode is direct):
    - Read the affected files
    - Make the targeted changes
    - Keep changes minimal and focused
    - Run the test suite after changes

11. If tests fail:
    - Analyze failures
    - Fix the implementation
    - Re-run tests

12. If the fix introduces new behavior that isn't covered by existing tests,
    write additional tests for the new behavior.

## Phase 4: VERIFY

13. Update `.looploop/progress.txt`:
    ```
    Phase: VERIFY
    Iteration: 1/1
    Status: Running final verification
    ```

14. Run the FULL test suite (not just affected tests).

15. Compare results against baseline:
    - All baseline tests must still pass (no regressions)
    - New tests must pass
    - If any baseline tests now fail, investigate — is it expected from the fix
      or a regression?

16. Present summary to the user:
    ```
    ## looploop-fix Summary

    **Task:** <what was fixed>
    **Files changed:** <list>
    **Tests:**
      - Baseline: X passing
      - Final: Y passing (Z new tests added)
      - Regressions: none | <details>
    **Status:** Complete | Needs attention
    ```

17. Clean up `.looploop/progress.txt`:
    ```
    Phase: DONE
    Iteration: 0/0
    Status: Fix complete
    ```
