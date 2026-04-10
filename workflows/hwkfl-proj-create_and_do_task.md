This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Create and Do Task

Autonomously create a task and execute it to completion in a single Orbh session. Combines spec creation and execution without interactive review stages.

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
- **Rename the file** to match the chosen title. If the file was created as a stub with a placeholder name (e.g. `(Task) 589 New Task.md`), rename it to `(Task) 589 <Chosen Title>.md` so the filename reflects the actual task content.
- Set Orbh interface:
  ```bash
  flint orbh set <id> phase "creating-task"
  flint orbh artifact <id> "<task name>"
  ```

## 2. Execute

- Read the task fully and implement until finished
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` to `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- Update the Orbh interface as you progress:
  ```bash
  flint orbh set <id> phase "implementing"
  flint orbh set <id> progress "<done>/<total> requirements"
  ```
- Track created or modified artifacts:
  ```bash
  flint orbh artifact <id> "<artifact name>"
  ```

### If Blocked

If you need a human decision or are blocked on an external dependency:
1. Log the blocker in the Task Log
2. Set task status to `blocked`
3. Use a deferred question:
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
  flint orbh return <id> "Created and completed task (Task) NNN <title>. <brief summary>. Moved to review."
  ```

# Output

- Task created and moved to `review` status with all checkboxes ticked
- Task Log updated with creation and execution progress
- Orbh result returned with completion summary
