# AGENTS.md

## Purpose

This repository uses AI coding agents to produce complete, production-quality work without wasting agent usage on deterministic or repetitive tasks.

The allowed coding agents are:

* GitHub Copilot
* OpenAI Codex

The goal is **high-quality results with proportional reasoning and minimal unnecessary agent usage**.

> Complete work does not mean maximum agent activity.
> Use the smallest amount of reasoning, context, tool calls, and iteration necessary to reach a correct result.

---

# 1. Core Rules

## 1.1 Finish the actual task

Do not stop at:

* a plan
* partial implementation
* pseudocode
* TODOs
* "you can finish this"
* unverified assumptions

When a task is accepted, implement the complete requested result.

However, do not manufacture additional work.

If the requested behavior works and the appropriate verification is complete, **stop**.

---

## 1.2 Use deterministic tools before AI reasoning

Before spending agent reasoning on a problem, determine whether normal tools can solve it.

Prefer:

* shell commands
* grep / ripgrep
* find
* git
* formatters
* linters
* type checkers
* existing scripts
* test runners
* package managers
* database tooling
* compiler errors
* framework diagnostics

Do not use expensive agent reasoning for something a deterministic command can answer immediately.

Examples:

* Need to find a file → `rg` / `find`
* Need to check formatting → formatter
* Need to know whether tests pass → test runner
* Need to inspect git changes → `git diff`
* Need to rename a symbol mechanically → editor/refactoring tool
* Need to count files → shell command

---

# 2. Agent Selection

Use the least expensive/simplest agent workflow that can correctly complete the task.

## Level 0 — Deterministic

No agent reasoning required.

Use normal tools for:

* searching
* formatting
* linting
* type checking
* running tests
* inspecting logs
* git operations
* file discovery
* simple transformations
* generated files

---

## Level 1 — Copilot

Use Copilot for:

* small bugs
* one-file changes
* small components
* localized refactors
* simple tests
* CSS/UI adjustments
* straightforward implementation

Do not escalate to Codex just because Codex is available.

---

## Level 2 — Copilot Agent

Use Copilot Agent for:

* multi-file features
* normal debugging
* moderate refactors
* API integration
* features requiring several coordinated changes

---

## Level 3 — Codex

Use Codex when the task genuinely benefits from longer autonomous reasoning or broader repository work.

Examples:

* repo-wide refactors
* complex architecture changes
* difficult debugging
* migrations
* complicated integrations
* large feature implementation
* security-sensitive changes
* concurrency/state-management problems
* tasks requiring many coordinated edits

Codex is not a replacement for Copilot on every task.

---

# 3. Never Duplicate Agent Work

Do not ask both Copilot and Codex to solve the same task unless there is a deliberate reason to compare approaches.

Avoid:

1. Copilot starts implementation.
2. Codex is asked to redo it.
3. Copilot reviews Codex.
4. Codex rewrites Copilot.
5. Both repeatedly critique each other.

This wastes agent usage without necessarily improving the result.

Prefer a single owner for each task.

### Recommended pattern

**Small task:**

`Copilot → verify → done`

**Large task:**

`Codex → verify → done`

**Large task followed by small adjustment:**

`Codex → verify → Copilot adjustment → verify → done`

---

# 4. Context Efficiency

Do not load the entire repository unless the task genuinely requires repository-wide understanding.

Prefer:

1. Search for relevant files.
2. Inspect the relevant symbols.
3. Read only the necessary surrounding context.
4. Implement.
5. Verify.

Avoid repeatedly reading:

* `node_modules`
* build output
* generated files
* lockfiles
* unrelated directories
* large documentation trees
* unrelated source files

unless they are relevant.

---

# 5. Task Scope

Before starting implementation, determine:

* What is being changed?
* What files are likely involved?
* What is the acceptance condition?
* What verification is required?

Do not spend excessive reasoning formalizing an obvious task.

For a simple request such as:

> "Fix the button alignment."

The acceptance condition can be implicit.

For a complex request such as:

> "Refactor authentication across the application."

Explicitly establish scope and constraints before modifying code.

---

# 6. Implementation Strategy

Prefer the smallest complete implementation.

Do not over-engineer.

Do not introduce:

* unnecessary abstractions
* unnecessary dependencies
* unnecessary configuration
* unnecessary architecture
* unnecessary files
* unnecessary comments
* unnecessary documentation

Use existing project patterns whenever they are appropriate.

Consistency with the repository is preferred over inventing a new pattern.

---

# 7. Testing Strategy

Tests are required when behavior changes.

However, testing must be proportional to the change.

## Small change

Run the narrowest useful verification.

Examples:

* targeted unit test
* targeted integration test
* typecheck
* lint
* specific command

## Medium change

Run:

* relevant tests
* typecheck
* lint where applicable

## Large/high-risk change

Run:

* targeted tests
* broader relevant suite
* typecheck
* lint
* integration/e2e tests where applicable

Use the repository's existing testing conventions.

Do not run massive unrelated test suites merely because they exist.

---

# 8. LONG-RUNNING TEST PROTOCOL

This is a critical rule.

## Never wait unnecessarily for a long-running test suite.

If tests are expected to take a significant amount of time, the agent should:

1. Finish writing/fixing the tests.
2. Finish the implementation.
3. Perform all fast local verification available.
4. Prepare **one final test command**.
5. Give the user the exact command to run.
6. Stop and wait for the user.

The agent must **not consume agent reasoning while waiting for the test process**.

### Example

Instead of:

> Run the entire suite and wait 25 minutes.

The agent should reach:

> Implementation complete.
> Tests prepared.
> Fast checks passed.
>
> Please run:
>
> `npm run test:e2e`
>
> When it finishes, paste the result here.

Then stop.

---

# 9. Returning From a Long Test

When the user returns with the test result, continue from the result.

### If tests pass

Do not rerun the same expensive command unnecessarily.

Proceed to:

* inspect final diff
* check for obvious issues
* report completion

### If tests fail

Use the actual failure output.

Do not blindly rerun the entire suite without changing anything.

Instead:

1. Identify the failing test.
2. Determine the likely cause.
3. Fix the issue.
4. Run the smallest relevant verification first.
5. If another long suite is required, provide the final command to the user again.

---

# 10. One Entry Command Rule

Whenever practical, consolidate long verification into one command.

Prefer:

```bash
npm run verify
```

over asking the user to manually execute:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

If the repository does not already have a suitable command, create one when appropriate.

For example:

```json
{
  "scripts": {
    "verify": "npm run lint && npm run typecheck && npm test"
  }
}
```

The exact command must match the project's technology and existing scripts.

Do not create a verification script solely to add abstraction around a trivial task.

---

# 11. Fast Checks Before Handing Tests to the User

Before asking the user to run a long command, the agent should perform inexpensive checks that are available.

Examples:

* syntax validation
* typecheck
* lint
* targeted unit tests
* static analysis
* git diff inspection

Do not make the user wait 30 minutes for a test that could have failed instantly because of a syntax error.

---

# 12. Do Not Waste Iterations

Once the implementation satisfies the acceptance criteria:

Stop.

Do not perform unnecessary cycles such as:

* rewrite
* critique
* rewrite again
* stylistic cleanup
* second critique
* another rewrite

unless a real problem was discovered.

A review pass is valuable when risk justifies it.

It is unnecessary for every tiny change.

---

# 13. Verification Hierarchy

Use verification from cheapest to most expensive.

### Tier 1

Instant/local:

* syntax
* formatting
* type checking
* linting
* static analysis

### Tier 2

Targeted:

* affected unit tests
* affected integration tests
* affected component tests

### Tier 3

Broad:

* full test suite
* e2e
* integration environments
* database-heavy verification

Start at the lowest relevant tier and escalate when required.

---

# 14. Context Escalation

If something fails, do not immediately reread the entire repository.

Escalate context gradually:

### First

Inspect:

* error message
* failing file
* failing test
* directly related code

### Then

Inspect:

* neighboring modules
* relevant configuration
* related interfaces/contracts

### Only then

Expand to broader repository architecture if necessary.

---

# 15. Search Before Building

Before creating something new, search the repository.

Look for:

* existing components
* utilities
* hooks
* services
* helpers
* types
* API clients
* test utilities
* configuration
* existing patterns

Reuse existing infrastructure when appropriate.

Do not duplicate functionality unnecessarily.

---

# 16. Tests Must Reflect Real Behavior

Do not create tests merely to increase test count.

Tests should verify meaningful behavior.

Prefer:

* user-visible behavior
* API contracts
* important business rules
* edge cases
* failure handling
* security boundaries
* regressions

Avoid excessive tests for implementation details that can change without changing behavior.

---

# 17. Security

Never weaken security to make a test pass.

Do not:

* disable authentication
* bypass authorization
* expose secrets
* commit API keys
* disable security middleware
* weaken validation
* ignore injection risks
* suppress security warnings without understanding them

If a secure implementation is more complex, use the complexity required to preserve security.

---

# 18. Dependencies

Before adding a dependency:

1. Check whether the repository already provides the capability.
2. Check whether a standard library solution is sufficient.
3. Check whether an existing dependency can solve it.
4. Add a new dependency only when it provides meaningful value.

Avoid dependency sprawl.

---

# 19. Documentation

Document meaningful architectural or behavioral decisions.

Do not generate large documentation for trivial changes.

Documentation should help future developers understand:

* why something exists
* important constraints
* non-obvious behavior
* operational requirements

Do not document obvious code line-by-line.

---

# 20. Git Awareness

After implementation:

1. Inspect `git diff`.
2. Confirm only intended files changed.
3. Check for accidental debug code.
4. Check for secrets.
5. Check for generated/unwanted files.

Do not automatically create commits unless requested or repository workflow explicitly requires it.

---

# 21. Completion Protocol

Before declaring completion, verify:

### Implementation

* Requested behavior exists.
* No obvious TODOs remain.
* No known broken path was intentionally ignored.

### Verification

* Appropriate fast checks were performed.
* Appropriate tests were prepared/run.
* Long-running tests were handed to the user instead of waiting unnecessarily.

### Diff

* Changes are scoped.
* No accidental files changed.
* No debug code remains.
* No secrets were introduced.

### Final status

Use exactly one:

* `DONE` — implementation and required verification are complete.
* `DONE_WITH_CONCERNS` — implementation is complete but a known limitation remains.
* `BLOCKED` — progress cannot continue without something external.
* `NEEDS_CONTEXT` — required information is missing.

---

# 22. Communication

Be concise.

When reporting work, state:

1. What changed.
2. What was verified.
3. What remains for the user.
4. The exact command if the user needs to run something.

For long-running tests, use:

> **Ready for verification**
>
> Run:
>
> `COMMAND`
>
> I have completed the implementation and fast checks.
> Run the command and send me the result.

Do not repeatedly explain the same thing.

---

# 23. Stop Conditions

Stop when:

* acceptance criteria are satisfied
* appropriate verification is complete
* no known blocking issue remains

Do not continue working simply because more improvements are possible.

"Could be improved" is not the same as "task is incomplete."

---

# 24. Final Principle

**Use intelligence where intelligence changes the outcome.**

Use deterministic tools for deterministic work.

Use Copilot for focused interactive work.

Use Codex for genuinely complex or autonomous work.

Do not spend agent usage:

* waiting for tests
* rereading unrelated files
* repeating failed approaches
* performing unnecessary critique cycles
* solving the same task twice
* polishing things that were not requested
* doing work that a shell command, test runner, formatter, or compiler can do better

The objective is:

**Correct → Complete → Verified → Stop.**
