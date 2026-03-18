# Projects Shard

This shard provides high-level planning and task management for Flint workspaces.

Projects mainly concern tasks. Tasks are a fundamental unit of work.

## Task Lifecycle

```
draft → todo → in-progress → review → done
                    ↓            ↑
                 blocked ────────┘

Any status → deprecated (terminal)
```

| Status | Meaning |
|--------|---------|
| `draft` | Spec being written, not yet actionable |
| `todo` | Ready to work on |
| `in-progress` | Actively being worked on |
| `blocked` | Waiting on human or external factor |
| `review` | Work complete, awaiting approval |
| `done` | Finished, ready to archive |
| `deprecated` | Obsolete or superseded by another task |

## Checkbox Tracking

When working on tasks, agents must tick off checkbox items (`- [ ]` → `- [x]`) immediately upon completing each requirement or done criterion. This keeps the task file as the single source of truth for progress.

# Dashboards

| Dashboard                         | Purpose                      | Maintained By                     |
| --------------------------------- | ---------------------------- | --------------------------------- |
| `(Dashboard) Backlog.md`          | Holds tasks                  | DataviewJS                |

# Skills

| Skill | File | Purpose |
|-------|------|---------|
| Capture As Task | `sk-proj-capture_as_task.md` | Capture recent work in a task artifact |
| Deprecate Task | `sk-proj-deprecate_task.md` | Mark a task as deprecated/superseded |
| Archive Tasks | `sk-proj-archive_tasks.md` | Archive completed tasks to `Mesh/Archive/Tasks/` |

# Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Create Task | `wkfl-proj-create_task.md` | Spec a new task with human review |
| Do Task | `wkfl-proj-do_task.md` | Execute a task through to completion |
| Create and Do Task | `wkfl-proj-create_and_do_task.md` | Create a task and immediately execute it |
| Review Task | `wkfl-proj-review_task.md` | QA review — verify completed work against requirements |
