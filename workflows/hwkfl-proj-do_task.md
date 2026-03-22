This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Do Task

Execute an existing task autonomously to completion via OrbH. No interactive stages — blockers use deferred questions, progress is reported via the OrbH interface.

# Input

- Task specification (an existing Task artifact)
- (Optional) Context or aiding prompts on how to complete the task
- (Optional) Refinement pass — if the task has prior session history, continue from where the last session left off rather than restarting

# Actions

## 1. Setup

- Read the task fully — frontmatter, context, requirements, definition of done, task log, notes
- Set task status to `in-progress`
- Set OrbH interface:
  ```bash
  flint orb set <id> phase "reading-task"
  flint orb set <id> progress "0/<N> requirements"
  ```
- If this is a refinement pass (task has prior session entries in the task log), review what was already done and pick up from there

## 2. Execute

- Implement the task requirements end to end
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` to `- [x]`)
- Update the OrbH interface as you progress:
  ```bash
  flint orb set <id> phase "implementing"
  flint orb set <id> progress "<done>/<total> requirements"
  ```
- Whenever you complete meaningful work, record it in the Task Log
- Track created or modified artifacts:
  ```bash
  flint orb artifact <id> "<artifact name>"
  ```

### If Blocked

If you need a human decision or are blocked on an external dependency:
1. Log the blocker in the Task Log
2. Set task status to `blocked`
3. Use a deferred question — this exits your session and resumes when answered:
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
  flint orb return <id> "Completed task (Task) NNN. <brief summary of what was done>. Moved to review."
  ```

# Output

- Task moved to `review` status with all checkboxes ticked
- Task Log updated with session progress
- OrbH result returned with completion summary
