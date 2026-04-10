# Skill: Deprecate Task

Mark a task as deprecated when it is no longer needed. Deprecation is a dead end — the work is abandoned with no successor.

# Input

- Task to deprecate
- (Optional) Reason for deprecation

# Actions

- Set the task `status` to `deprecated`
- Add a deprecation entry to the Task Log with:
  - Date (YYYY-MM-DD format)
  - Reason for deprecation
- Report the deprecation to the user

# Notes

- **Deprecate vs Supersede**: Use `deprecate_task` when work is abandoned with no successor (dead end). Use `supersede_task` when the task's scope was taken over by another task (redirect). If a successor task exists, use `supersede_task` instead.
- Deprecated tasks remain in the filesystem but are excluded from active dashboard views
- Use this status when requirements changed, the work is no longer needed, or the task was created in error
- The task number is preserved to maintain referential integrity
