---
description: Resume an interrupted looploop session from the last snapshot
---

# /looploop-resume

Resume an interrupted looploop session.

## Process

1. Check if `.looploop/` directory exists. If not:
   "No looploop session to resume. Start one with /looploop or /looploop-fix."

2. Read `.looploop/progress.txt` to determine current phase and iteration.

3. Read `.looploop/config.json` for session configuration.

4. Read the latest snapshot file in `.looploop/`.

5. Read `.looploop/prd.md` for context (if it exists — full mode only).

6. Based on current phase, resume:

   **Phase: PRD** → Dispatch prd-architect agent to continue PRD generation.

   **Phase: TDD** → Dispatch test-writer agent. Provide:
   - `.looploop/prd.md`
   - `.looploop/config.json`
   - Latest snapshot for context
   - Current iteration number

   **Phase: IMPL** → Dispatch implementer agent. Provide:
   - `.looploop/prd.md`
   - `.looploop/config.json`
   - Test files
   - Latest snapshot for context
   - Current iteration number

   **Phase: GUARD** (light mode) → Dispatch coverage-guard agent with
   affected files from config.

   **Phase: VERIFY** → Run final verification (full test suite + summary).

   **Phase: DONE** → "Session already complete. Start a new one with /looploop or /looploop-fix."

7. Report what phase is being resumed and continue the workflow.
