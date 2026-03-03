# looploop

![LoopLoop](avatar.webp)

XP pair-programming plugin for Claude Code. PRD-driven TDD with iterative implementation.

You define the skeleton. AI places the organs.

## Install

Inside Claude Code, run:

```bash
# Add the marketplace (one-time)
/plugin marketplace add Emerson1337/erms-arsenal

# Install looploop
/plugin install looploop@erms-arsenal
```

Or install manually:

```bash
# Clone directly
git clone git@github.com:Emerson1337/looploop.git ~/.claude/plugins/looploop
```

## Usage

### Full Mode — `/looploop`

For new features and substantial work. Runs the complete pipeline:

```
PRD → TDD → Implement → Iterate
```

```bash
/looploop Build a REST API for user management with JWT auth
```

**What happens:**

1. Detects your stack and test framework
2. Generates a technical PRD (auto-reviewed)
3. Writes tests first — targeting 100% coverage (2 iterations default)
4. Implements code to pass tests (3 iterations default)
5. Presents final summary with results

### Light Mode — `/looploop-fix`

For bugfixes, small features, and refactors. Skips PRD ceremony:

```
Understand → Test Guard → Implement → Verify
```

```bash
/looploop-fix Fix token expiry check that allows expired tokens through
```

**What happens:**

1. Identifies affected files
2. Finds existing tests, establishes baseline (writes missing tests if needed)
3. Makes the fix
4. Verifies no regressions, reports results

### Other Commands

```bash
/looploop-status    # Check current session progress
/looploop-resume    # Resume an interrupted session
/looploop-upgrade   # Upgrade to the latest version
```

## How It Works

### Flow Overview

#### Full Mode — `/looploop`

```mermaid
flowchart TD
    Start(["/looploop Build a REST API..."]) --> Detect["Detect stack & test framework"]
    Detect --> Config["Configure session\n(type, iterations, team mode)"]

    Config --> PRD_Start["Phase 1: PRD"]
    PRD_Start --> Architect["prd-architect\nGenerates technical PRD"]
    Architect --> Reviewer["prd-reviewer\nRefines & validates PRD"]
    Reviewer --> Approve{"User approves\nPRD?"}
    Approve -- Edit --> Reviewer
    Approve -- Yes --> TDD_Start

    TDD_Start["Phase 2: TDD"] --> TestWriter["test-writer\nWrites tests from PRD"]
    TestWriter --> RunTests1["Run tests\n(expect failures — no impl yet)"]
    RunTests1 --> Snapshot1["Write snapshot"]
    Snapshot1 --> TDD_Check{"More TDD\niterations?"}
    TDD_Check -- "Yes (default: 2)" --> TestWriter
    TDD_Check -- No --> Impl_Start

    Impl_Start["Phase 3: Implementation"] --> TeamCheck{"Team mode?"}

    TeamCheck -- No --> Implementer["implementer\nWrites code to pass tests"]
    Implementer --> RunTests2["Run full test suite"]
    RunTests2 --> FixImpl{"Tests pass?"}
    FixImpl -- "No → fix code" --> Implementer
    FixImpl -- Yes --> Snapshot2["Write snapshot"]

    TeamCheck -- Yes --> Lead["implementer-lead\nSplits work into domains"]
    Lead --> Spawn["Spawn workers\n(1 per domain, isolated worktrees)"]
    Spawn --> Parallel["Workers implement\nin parallel"]
    Parallel --> Integrate["Lead integrates &\nresolves conflicts"]
    Integrate --> RunTests3["Run full test suite"]
    RunTests3 --> Snapshot2

    Snapshot2 --> Impl_Check{"More impl\niterations?"}
    Impl_Check -- "Yes (default: 3)" --> Impl_Start
    Impl_Check -- No --> Summary

    Summary(["Phase 4: Summary\nTests passing · Files changed · Next steps"])

    style Start fill:#6366f1,color:#fff
    style Summary fill:#22c55e,color:#fff
    style PRD_Start fill:#f59e0b,color:#fff
    style TDD_Start fill:#06b6d4,color:#fff
    style Impl_Start fill:#ec4899,color:#fff
```

#### Light Mode — `/looploop-fix`

```mermaid
flowchart TD
    Start(["/looploop-fix Fix token expiry..."]) --> Detect["Detect stack & affected files"]

    Detect --> Guard["Phase 1: Test Guard"]
    Guard --> FindTests["coverage-guard\nFinds existing tests"]
    FindTests --> Baseline["Establish baseline\n(run existing tests)"]
    Baseline --> Missing{"Uncovered\ncode?"}
    Missing -- Yes --> WriteTests["Write missing tests\nfor current behavior"]
    WriteTests --> Baseline2["Verify new tests pass"]
    Missing -- No --> Impl
    Baseline2 --> Impl

    Impl["Phase 2: Implement Fix"] --> MakeFix["Apply targeted changes"]
    MakeFix --> RunTests["Run test suite"]
    RunTests --> Check{"Tests pass?"}
    Check -- "No → adjust fix" --> MakeFix
    Check -- Yes --> Verify

    Verify["Phase 3: Verify"] --> FullSuite["Run full test suite"]
    FullSuite --> Compare["Compare against baseline\n(no regressions)"]
    Compare --> Done(["Summary\nBaseline vs final · Regressions · Status"])

    style Start fill:#6366f1,color:#fff
    style Done fill:#22c55e,color:#fff
    style Guard fill:#3b82f6,color:#fff
    style Impl fill:#ec4899,color:#fff
    style Verify fill:#f59e0b,color:#fff
```

### Agents

| Agent            | Role                                              |
| ---------------- | ------------------------------------------------- |
| `prd-architect`  | Generates PRD from task description               |
| `prd-reviewer`   | Auto-reviews and refines PRD                      |
| `test-writer`    | Writes tests before implementation (TDD)          |
| `implementer`    | Implements code to pass tests                     |
| `implementer-lead` | Splits PRD into domains, spawns parallel workers (team mode) |
| `coverage-guard` | Finds/writes tests for affected code (light mode) |

### Team Mode

Opt-in during `/looploop` setup when asked "Want to use team mode?"

When enabled, the `implementer-lead` agent replaces `implementer` during Phase 3. Each iteration:

1. **Analyze** — Reads PRD and test results, groups work into independent domains (max 5)
2. **Spawn** — Creates a team with one worker agent per domain, each in an isolated worktree
3. **Coordinate** — Workers implement their scope in parallel; lead resolves conflicts
4. **Integrate** — Merges worker output, fixes wiring/re-exports, runs full test suite

The iteration loop runs normally — each iteration spins up a fresh team. First pass gets the bulk done, subsequent passes target remaining failures.

**When to use:** Large features with multiple independent areas (e.g., auth + API + UI). **When not to use:** Small features, tightly coupled code where parallelism adds overhead.

### Iteration Loop

A stop hook (`hooks/check-iteration.mjs`) reads `.looploop/progress.txt` and continues the current phase if iterations remain. Default iterations:

- TDD phase: 2
- Implementation phase: 3

### Session State

All state lives in `.looploop/` in your project root:

```
.looploop/
├── config.json          # Session configuration
├── progress.txt         # Current phase and iteration
├── prd.md               # PRD (full mode)
├── baseline.txt         # Test baseline (light mode)
└── snapshot-*.md        # Iteration snapshots
```

Add `.looploop/` to your `.gitignore`.

### Why Node.js?

Hook scripts are written in Node.js (`.mjs`). Claude Code already requires Node.js as a runtime dependency, so it's guaranteed to be available on any machine running this plugin. This gives us cross-platform compatibility (macOS, Linux, Windows) without relying on shell-specific syntax like bash or zsh.

## Philosophy

- **XP pair programming**: AI drives, you navigate
- **TDD always**: Tests before implementation, no exceptions
- **Small iterations**: 2-3 passes per phase — enough to refine, cheap on tokens
- **Simple design**: PRD keeps scope tight, out-of-scope is explicit
- **Collective ownership**: PRD, tests, and code are all in the repo

## Credits

Thanks to [Fabio Akita](https://github.com/akitaonrails) for sharing insights.

Inspired by [Ralph Loop](https://github.com/ralphloop).

Looploop wouldn't be done without these.
