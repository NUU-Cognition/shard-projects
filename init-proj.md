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

# Dashboards

| Dashboard                         | Purpose                      | Maintained By                     |
| --------------------------------- | ---------------------------- | --------------------------------- |
| `(Dashboard) Backlog.md`          | Holds tasks                  | DataviewJS                |

# Skills

| Skill | File | Purpose |
|-------|------|---------|
| Capture As Task | `sk-proj-capture_as_task.md` | Capture recent work in a task artifact |
| Deprecate Task | `sk-proj-deprecate_task.md` | Mark a task as deprecated/superseded |

# Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Create Task | `wkfl-proj-create_task.md` | Spec a new task with human review |
| Do Task | `wkfl-proj-do_task.md` | Execute a task through to completion |
