# Skill: Deprecate Task

Mark a task as deprecated when it is obsolete or superseded by another task.

# Input

- Task to deprecate
- (Optional) Reason for deprecation
- (Optional) Superseding task reference

# Actions

- Set the task `status` to `deprecated`
- Add a deprecation entry to the Task Log with:
  - Date (YYYY-MM-DD format)
  - Reason for deprecation
  - Link to superseding task if applicable
- If a superseding task is specified, add a "Supersedes" note in the Related Documents section of the new task
- Report the deprecation to the user

# Notes

- Deprecated tasks remain in the filesystem but are excluded from active dashboard views
- Use this status when a task is replaced by a better-scoped task, requirements changed, or the work is no longer needed
- The task number is preserved to maintain referential integrity
