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
todo → in-progress → review → reviewing → done
            ↓                      ↓
         blocked ←←←←←←←←←←←←←←←←┘

Any status → deprecated (terminal)
```

| Status | Meaning |
|--------|---------|
| `todo` | Ready to work on |
| `in-progress` | Actively being implemented |
| `blocked` | Waiting on human decision or external dependency |
| `review` | Implementation complete, awaiting QA |
| `reviewing` | QA actively in progress |
| `done` | Finished, ready to archive |
| `deprecated` | Obsolete or superseded by another task |

Queue/active symmetry:

| Phase | Queue (waiting) | Active (working) |
|-------|----------------|-------------------|
| Implementation | `todo` | `in-progress` |
| QA | `review` | `reviewing` |

### Blocked transitions

A task moves to `blocked` when work cannot continue without human input or an external dependency. When the blocker is resolved, the task returns to whichever active state it came from (`in-progress` or `reviewing`). Always log the reason for blocking and the resolution in the Task Log.

```
in-progress → blocked    (log: what's blocking and why)
reviewing → blocked      (log: what's blocking and why)
blocked → in-progress    (log: blocker resolved, resuming implementation)
blocked → reviewing      (log: blocker resolved, resuming QA)
```

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
| Deprecate Task | `sk-proj-deprecate_task.md` | Mark a task as deprecated/superseded |
| Archive Tasks | `sk-proj-archive_tasks.md` | Archive completed tasks to `Mesh/Archive/Tasks/` *(stub)* |

# Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Create Task | `wkfl-proj-create_task.md` | Spec a new task with human review (planning) |
| Do Task | `wkfl-proj-do_task.md` | Execute a task through to completion |
| Create and Do Task | `wkfl-proj-create_and_do_task.md` | Create and immediately execute a task |
| Review Task | `wkfl-proj-review_task.md` | QA review — verify completed work against requirements |
