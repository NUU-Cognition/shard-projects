# Skill: Capture As Work

Capture the latest actions done in the session as a task

# Actions

- Create a task using the @tmp-proj-task template which captures the work done recently. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment using `[[Hyperlink]]` syntax. All tasks must belong to an increment. To determine the increment:
  1. If the work was done under a specific increment, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the latest `.A.0` adhoc increment (e.g., `3.A.0` if checkpoint is `3.0.0`)
- Because the task has already been done, make sure the task status should be marked as done
- Make sure the task is appended to the increment's log.
- Report any actions to the user. 