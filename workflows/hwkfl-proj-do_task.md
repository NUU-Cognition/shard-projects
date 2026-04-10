This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Do Task

Execute an existing task autonomously to completion via Orbh. No interactive stages — blockers use deferred questions, progress is reported via the Orbh interface.

# Input

- Task specification (an existing Task artifact)
- (Optional) Context or aiding prompts on how to complete the task
- (Optional) Refinement pass — if the task has prior session history, continue from where the last session left off rather than restarting

# Actions

## 1. Setup

- Read the task fully — frontmatter, context, requirements, definition of done, task log, notes
- Set task status to `in-progress`
- Set Orbh interface:
  ```bash
  flint orbh set <id> phase "reading-task"
  flint orbh set <id> progress "0/<N> requirements"
  ```
- If this is a refinement pass (task has prior session entries in the task log), review what was already done and pick up from there

## 2. Execute

- Implement the task requirements end to end
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` to `- [x]`)
- Update the Orbh interface as you progress:
  ```bash
  flint orbh set <id> phase "implementing"
  flint orbh set <id> progress "<done>/<total> requirements"
  ```
- Whenever you complete meaningful work, record it in the Task Log
- Track created or modified artifacts:
  ```bash
  flint orbh artifact <id> "<artifact name>"
  ```

### If Blocked

If you need a human decision or are blocked on an external dependency:
1. Log the blocker in the Task Log
2. Set task status to `blocked`
3. Use a deferred question — this exits your session and resumes when answered:
   ```bash
   flint orbh request <id> "<clear question describing what you need>"
   ```

When resumed after a response, read the answer and continue execution.

### Committing Repo Work

If the task has a `git-repos` field, you must commit your changes as WIP commits before completing. See [[knw-proj-wip_commits]] for the full convention. In short, for each repo in `git-repos`:

1. Resolve the repo path (wikilink via `flint resolve codebase`, or use the plain name/path)
2. `cd` to the repo
3. `git add` only the files you edited (never `git add -A`)
4. `git commit -m "[OR] wip: <Flint Name>/(Task) NNN Name"` (flint name without the (Flint) prefix)
5. Record the commit SHA in the task's `wip-commits` field (annotate with repo name in parens if multiple repos)
6. `cd` back to the Flint root

If there is no `git-repos` field, skip this step.

## 3. Complete

- Verify all requirement and definition-of-done checkboxes are ticked
- Set task status to `review`
- Add a final Task Log entry summarising the work done
- Return your result:
  ```bash
  flint orbh set <id> phase "complete"
  flint orbh return <id> "Completed task (Task) NNN. <brief summary of what was done>. Moved to review."
  ```

# Output

- Task moved to `review` status with all checkboxes ticked
- Task Log updated with session progress
- Orbh result returned with completion summary
