> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

# Skill: Capture As Work

Capture the latest actions done in the session as a task

# Actions

- Create a task using the @tmp-proj-task template which captures the work done recently. Get the next task number with `flint helper type newnumber Task`.
- Set the `from` field if a parent context is known. The `from` field is optional — leave it blank unless a parent is clear:
  1. If the work was done under a specific increment or mission, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, leave `from` blank
- Because the task has already been done, make sure the task status should be marked as done
- If the task has a `from` that points to an increment, append the task to that increment's log.
- Report any actions to the user.