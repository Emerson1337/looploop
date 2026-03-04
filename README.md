# looploop

![LoopLoop](avatar.webp)

XP pair-programming plugin for Claude Code. PRD-driven TDD with iterative implementation.

You define the skeleton. AI places the organs.

## When to Use looploop

looploop shines when correctness is verifiable by tests. It struggles when correctness depends on browser behavior that unit tests can't simulate.

### Good case

**Idea:** Domain-logic-heavy app where correctness is verifiable by tests — calculations, rules, state transitions, edge cases.

**Prompt:**
> Build a personal budget tracker.
>
> Stack: React + TypeScript + Vite + Tailwind + Zustand. Persist to localStorage.
>
> Domain rules:
> - Transactions have: amount (in cents), category, date, type (income | expense)
> - Each category has a monthly spending limit
> - Remaining = limit − expenses in current calendar month for that category
> - Over budget when remaining < 0
> - Savings rate = (income − expenses) / income × 100, clamped to [-100, 100]. If income is 0, rate is 0
> - Burn rate = total expenses ÷ days elapsed this month (min 1 day)
> - Projected spend = burn rate × total days in month
> - At-risk category: projected spend > 80% of limit, even if not yet over budget
> - All values stored as integer cents to avoid floating-point errors
>
> UI: dashboard with totals and savings rate, category list with status (ok / at-risk / over-budget), transaction list filterable by category and month, forms to add transactions and set category limits.

**Why it works:** Every business rule maps directly to a unit test. The test-writer encodes the edge cases (income = 0, cents arithmetic, at-risk threshold) before any code is written. The implementer can't skip them.

---

### Bad case

**Idea:** Visually interactive app where correctness depends on browser behavior that unit tests can't easily simulate.

**Prompt:**
> Build a Kanban board with drag and drop between columns.
>
> Stack: React + TypeScript + Vite + Tailwind + @dnd-kit. Persist to localStorage.
>
> - 3 columns: Backlog, In Progress, Done
> - Cards have title, priority, and description
> - Drag cards between columns and reorder within columns
> - Animations on add, delete, and drag
> - Empty column placeholder
> - Dark glassmorphism design

**Why it underperforms:** Drag-and-drop correctness lives in browser pointer events and droppable registration — things jsdom can't simulate. The test-writer will test what it can (store logic, renders), but can't write a test that catches a missing `useDroppable` on a column. The implementer passes all tests and ships broken drop behavior. A plain prompt that has seen hundreds of @dnd-kit examples outperforms here.

---

**Rule of thumb:** if the most important bugs would be caught by `expect(result).toBe(x)`, looploop wins. If they'd only be caught by a human clicking around in a browser, it won't.

## Requirements for team mode

[Agent teams](https://code.claude.com/docs/en/agent-teams) are experimental and disabled by default. Enable them by adding `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to your `settings.json` or environment. Agent teams have known limitations around session resumption, task coordination, and shutdown behavior.

**Be aware costs scale with the team, so use it sparingly**.

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

### Review Mode — `/looploop-review`

Reviews uncommitted changes for test coverage gaps (targeting 100%) and PRD alignment:

```
Analyze → Review → Offer Fix
```

```bash
/looploop-review
```

**What happens:**

1. Collects all local changes (`git diff`)
2. Checks if changed code paths have test coverage
3. If a PRD exists, checks alignment with acceptance criteria
4. Presents a report with verdict (PASS / NEEDS TESTS / NEEDS REVIEW / NEEDS BOTH)
5. Offers to auto-write missing tests via `coverage-guard`

### Other Commands

```bash
/looploop-status    # Check current session progress
/looploop-resume    # Resume an interrupted session
/looploop-upgrade   # Upgrade to the latest version
```

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

## How It Works

### Flow Overview

#### Full Mode — `/looploop`

```mermaid
flowchart TD
    Start(["/looploop Build a REST API..."]) --> Detect["Detect stack & test framework"]
    Detect --> Config["Configure session<br/>(type, iterations, team mode)"]

    Config --> PRD_Start["Phase 1: PRD"]
    PRD_Start --> Architect["prd-architect<br/>Generates technical PRD"]
    Architect --> Reviewer["prd-reviewer<br/>Refines & validates PRD"]
    Reviewer --> Approve{"User approves<br/>PRD?"}
    Approve -- Edit --> Reviewer
    Approve -- Yes --> TDD_Start

    TDD_Start["Phase 2: TDD"] --> TestWriter["test-writer<br/>Writes tests from PRD"]
    TestWriter --> RunTests1["Run tests<br/>(expect failures — no impl yet)"]
    RunTests1 --> Snapshot1["Write snapshot"]
    Snapshot1 --> TDD_Check{"More TDD<br/>iterations?"}
    TDD_Check -- "Yes (default: 2)" --> TestWriter
    TDD_Check -- No --> Impl_Start

    Impl_Start["Phase 3: Implementation"] --> TeamCheck{"Team mode?"}

    TeamCheck -- No --> Implementer["implementer<br/>Writes code to pass tests"]
    Implementer --> RunTests2["Run full test suite"]
    RunTests2 --> FixImpl{"Tests pass?"}
    FixImpl -- "No → fix code" --> Implementer
    FixImpl -- Yes --> Snapshot2["Write snapshot"]

    TeamCheck -- Yes --> Lead["implementer-lead<br/>Splits work into domains"]
    Lead --> Spawn["Spawn workers<br/>(1 per domain, isolated worktrees)"]
    Spawn --> Parallel["Workers implement<br/>in parallel"]
    Parallel --> Integrate["Lead integrates &<br/>resolves conflicts"]
    Integrate --> RunTests3["Run full test suite"]
    RunTests3 --> Snapshot2

    Snapshot2 --> Impl_Check{"More impl<br/>iterations?"}
    Impl_Check -- "Yes (default: 3)" --> Impl_Start
    Impl_Check -- No --> Summary

    Summary(["Phase 4: Summary<br/>Tests passing · Files changed · Next steps"])

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
    Guard --> FindTests["coverage-guard<br/>Finds existing tests"]
    FindTests --> Baseline["Establish baseline<br/>(run existing tests)"]
    Baseline --> Missing{"Uncovered<br/>code?"}
    Missing -- Yes --> WriteTests["Write missing tests<br/>for current behavior"]
    WriteTests --> Baseline2["Verify new tests pass"]
    Missing -- No --> Impl
    Baseline2 --> Impl

    Impl["Phase 2: Implement Fix"] --> MakeFix["Apply targeted changes"]
    MakeFix --> RunTests["Run test suite"]
    RunTests --> Check{"Tests pass?"}
    Check -- "No → adjust fix" --> MakeFix
    Check -- Yes --> Verify

    Verify["Phase 3: Verify"] --> FullSuite["Run full test suite"]
    FullSuite --> Compare["Compare against baseline<br/>(no regressions)"]
    Compare --> Done(["Summary<br/>Baseline vs final · Regressions · Status"])

    style Start fill:#6366f1,color:#fff
    style Done fill:#22c55e,color:#fff
    style Guard fill:#3b82f6,color:#fff
    style Impl fill:#ec4899,color:#fff
    style Verify fill:#f59e0b,color:#fff
```

### Agents

| Agent              | Role                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `prd-architect`    | Generates PRD from task description                                 |
| `prd-reviewer`     | Auto-reviews and refines PRD                                        |
| `test-writer`      | Writes tests before implementation (TDD)                            |
| `implementer`      | Implements code to pass tests                                       |
| `implementer-lead` | Splits PRD into domains, spawns parallel workers (team mode)        |
| `coverage-guard`   | Finds/writes tests for affected code (light mode)                   |
| `diff-reviewer`    | Reviews diff for test coverage gaps and PRD alignment (review mode) |

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
├── review-report.md     # Review report (review mode)
└── snapshot-*.md        # Iteration snapshots
```

Add `.looploop/` to your `.gitignore`.

### Why Node.js?

Hook scripts are written in Node.js (`.mjs`). Claude Code already requires Node.js as a runtime dependency, so it's guaranteed to be available on any machine running this plugin. This gives us cross-platform compatibility (macOS, Linux, Windows) without relying on shell-specific syntax like bash or zsh.
