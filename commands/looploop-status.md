---
description: Check the current status of a looploop session
---

# /looploop-status

Read and display the current state of a looploop session.

## Process

1. Check if `.looploop/` directory exists. If not: "No active looploop session."

2. Read `.looploop/progress.txt` — current phase and iteration.

3. Read `.looploop/config.json` — session type and configuration.

4. Find the latest snapshot file in `.looploop/` (sort by filename).

5. Present a concise summary:

   ```
   ## looploop Status

   **Mode:** Full (PRD → TDD → Impl) | Light (fix)
   **Task:** <task description>
   **Phase:** <current phase> (Iteration <N>/<max>)
   **Tests:** <passing>/<total> passing
   **Last action:** <from progress.txt>
   **Next:** <from progress.txt>
   ```

6. If there are failing tests, list them from the latest snapshot.
