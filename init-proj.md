# Projects Shard

Task management for Flint workspaces. Tasks are the fundamental unit of work.

## Two Concerns

The Projects shard serves two distinct purposes:

| Concern | What it does | Status |
|---------|-------------|--------|
| **Execution** | Create tasks, work tasks, review completed work, capture retroactive work | Built — workflows, skills, and dashboard are operational |
| **Planning** | Prioritize, schedule, track project-level status, roadmap | Future — fields exist in the template but no planning-specific dashboard or workflows yet |

The **Backlog dashboard** is an execution view — it shows all tasks grouped by status, sorted by number. It does not organize by priority or due date. When the planning layer is built, it will get its own dashboard and workflows.

### Execution workflows and skills

| Tool | Type | Purpose |
|------|------|---------|
| Create and Do Task | Workflow | Create a task and immediately work it to completion |
| Do Task | Workflow | Pick up an existing task and work it to done |
| Review Task | Workflow | QA — verify completed work against requirements |
| Capture As Task | Skill | Retroactively record work already done as a completed task |
| Archive Tasks | Skill | Move completed tasks to `Mesh/Archive/Tasks/` *(stub — not yet implemented)* |

### Planning workflows and skills

| Tool | Type | Purpose |
|------|------|---------|
| Create Task | Workflow | Spec a task for later — sets it as `todo`, refines with human review |
| Deprecate Task | Skill | Triage a task out of the backlog |

## Tasks and Increments

Every task must belong to an increment. The `increment` frontmatter field links the task to its parent increment using wikilink syntax:

```yaml
increment: "[[(Increment) 6.10 - Shard Improvements]]"
```

When creating a task, determine the increment:
1. If the user specifies one, use that
2. If the task clearly relates to an active increment, use that
3. Otherwise, default to the current adhoc increment (e.g., `6.A`)

## Task Lifecycle

```
todo → in-progress → review → reviewing → reviewed → done
            ↓                      ↓
         blocked ←←←←←←←←←←←←←←←←┘

Any active status → deferred (intentional pause)
deferred → in-progress (continue directly)

Supersession (any status → terminal + superseded-by):
  → done + superseded-by         (work finished, successor extends scope)
  → superseded + superseded-by   (incomplete but valid, successor picks up)
  → deprecated + superseded-by   (stale/invalid, successor takes different path)

Any status → deprecated (terminal, dead end — no successor)
```

| Status | Meaning |
|--------|---------|
| `todo` | Ready to work on |
| `in-progress` | Actively being implemented |
| `blocked` | Waiting on human decision or external dependency |
| `deferred` | Intentionally shelved — will continue later or be superseded |
| `review` | Implementation complete, awaiting QA |
| `reviewing` | QA actively in progress |
| `reviewed` | QA passed, awaiting human acknowledgement before closing |
| `done` | Finished, ready to archive |
| `deprecated` | No longer needed — dead end with no successor |
| `superseded` | Incomplete but valid work — scope picked up by a successor |

### Supersession

Supersession is a **relationship**, not a status. The `superseded-by` field can coexist with different terminal statuses, each reflecting how far the original work got before succession:

| Scenario | Status | Has `superseded-by`? | Meaning |
|----------|--------|---------------------|---------|
| Task fully completed, successor extends scope | `done` | Yes | Work was finished; successor builds on it |
| Task partially complete or unverified | `superseded` | Yes | Valid work exists but incomplete; successor picks it up |
| Task outdated or approach was wrong | `deprecated` | Yes | Stale work; successor takes a different path |
| Task abandoned with no successor | `deprecated` | No | Dead end — no continuation |

The `supersede_task` skill accepts a target status (`done`, `superseded`, or `deprecated`) when creating the supersession link. See [[sk-proj-supersede_task]] for details.

### Dynamic Relationship Fields

These fields are not part of the task template. They are added dynamically by the `supersede_task` skill when a supersession relationship is created. They can appear on tasks in any terminal status.

| Field | On | Type | Purpose |
|-------|----|------|---------|
| `superseded-by` | Old task | wikilink | Points to the successor task — can coexist with `done`, `superseded`, or `deprecated` status |
| `continues-from` | New task | wikilink | Points to the predecessor task this work continues |

Queue/active symmetry:

| Phase | Queue (waiting) | Active (working) |
|-------|----------------|-------------------|
| Implementation | `todo` | `in-progress` |
| QA | `review` | `reviewing` |

The `reviewed → done` transition is a manual human action. Agents set tasks to `reviewed` after QA passes; only a human moves them to `done`.

### Blocked transitions

A task moves to `blocked` when work cannot continue without human input or an external dependency. When the blocker is resolved, the task returns to whichever active state it came from (`in-progress` or `reviewing`). Always log the reason for blocking and the resolution in the Task Log.

```
in-progress → blocked    (log: what's blocking and why)
reviewing → blocked      (log: what's blocking and why)
blocked → in-progress    (log: blocker resolved, resuming implementation)
blocked → reviewing      (log: blocker resolved, resuming QA)
```

### Deferred transitions

A task moves to `deferred` when work is intentionally paused — not because of an external blocker, but because the team chooses to shelve it for now. Unlike `blocked`, there is no specific dependency to resolve; the task is simply not a priority right now.

When resuming a deferred task, there are two paths:

```
in-progress → deferred   (log: why the task is being shelved)
reviewing → deferred     (log: why the task is being shelved)
deferred → in-progress   (log: resuming work directly)
deferred → superseded via supersede_task skill (creates successor, links the two)
```

The typical pattern when resuming is to supersede the deferred task with a fresh successor (via the Supersede Task skill), carrying forward any unchecked requirements. Direct continuation (`deferred → in-progress`) is also supported when the original task scope is still valid.

## Repo Work and WIP Commits

When a task involves editing files in a git repository, the task's `git-repos` frontmatter field lists the repos it edits — either as wikilinks to codebase references (e.g. `[[rf-cb-flint]]`) or plain repo names.

**Branch guard:** Before making any edits to a repo, check the current branch. If you are on `dev` or `main`, you MUST branch to the machine branch first using `orbrepo open`. Never commit WIP directly to `dev`.

Before moving a task to review, agents must commit their changes in each repo as a **WIP commit**:

```
[OR] wip: <Flint Name>/(Task) NNN Name
```

After each commit, record the SHA in the task's `wip-commits` field. If the task edits multiple repos, annotate each SHA with the repo name in parentheses (e.g. `"a1b2c3d (rf-cb-flint)"`).

Stage only the files you edited (never `git add -A`). See [[knw-proj-wip_commits]] for the full convention, philosophy, staging rules, and commit sequence.

The `checkpointed` and `pr` fields on tasks are written by OrbRepo agents (checkpoint and close) — never set them yourself.

## Checkbox Tracking

When working on tasks, agents must tick off checkbox items (`- [ ]` → `- [x]`) immediately upon completing each requirement or done criterion. This keeps the task file as the single source of truth for progress.

# Dashboards

| Dashboard | Purpose | Maintained By |
|-----------|---------|---------------|
| `(Dashboard) Backlog.md` | Execution status of all tasks | DataviewJS |

# Skills

| Skill | File | Purpose |
|-------|------|---------|
| Capture As Task | `sk-proj-capture_as_task.md` | Capture recent work as a completed task |
| Deprecate Task | `sk-proj-deprecate_task.md` | Mark a task as deprecated — dead end with no successor |
| Supersede Task | `sk-proj-supersede_task.md` | Mark a task as superseded — redirect to a successor task |
| Archive Tasks | `sk-proj-archive_tasks.md` | Archive completed tasks to `Mesh/Archive/Tasks/` *(stub)* |

# Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Create Task | `wkfl-proj-create_task.md` | Spec a new task with human review (planning) |
| Do Task | `wkfl-proj-do_task.md` | Execute a task through to completion |
| Create and Do Task | `wkfl-proj-create_and_do_task.md` | Create and immediately execute a task |
| Review Task | `wkfl-proj-review_task.md` | QA review — verify completed work against requirements |
