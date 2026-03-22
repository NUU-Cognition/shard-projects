This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Create and Do Task

Autonomously create a task and execute it to completion in a single OrbH session. Combines spec creation and execution without interactive review stages.

# Input

- Context of a task
- (Optional) Aiding prompts and instructions on how to complete the task

# Actions

## 1. Create

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment. To determine the increment:
  1. If specified in the prompt, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the current adhoc increment (e.g., `6.A`)
- Set status to `in-progress` (since we're immediately executing)
- Set OrbH interface:
  ```bash
  flint orb set <id> phase "creating-task"
  flint orb artifact <id> "<task name>"
  ```

## 2. Execute

- Read the task fully and implement until finished
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` to `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- Update the OrbH interface as you progress:
  ```bash
  flint orb set <id> phase "implementing"
  flint orb set <id> progress "<done>/<total> requirements"
  ```
- Track created or modified artifacts:
  ```bash
  flint orb artifact <id> "<artifact name>"
  ```

### If Blocked

If you need a human decision or are blocked on an external dependency:
1. Log the blocker in the Task Log
2. Set task status to `blocked`
3. Use a deferred question:
   ```bash
   flint orb request <id> "<clear question describing what you need>"
   ```

When resumed after a response, read the answer and continue execution.

## 3. Complete

- Verify all requirement and definition-of-done checkboxes are ticked
- Set task status to `review`
- Add a final Task Log entry summarising the work done
- Return your result:
  ```bash
  flint orb set <id> phase "complete"
  flint orb return <id> "Created and completed task (Task) NNN <title>. <brief summary>. Moved to review."
  ```

# Output

- Task created and moved to `review` status with all checkboxes ticked
- Task Log updated with creation and execution progress
- OrbH result returned with completion summary
