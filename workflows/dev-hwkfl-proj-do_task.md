---
orbh-sessions:
  - "[[87347e6b-2363-4434-9a98-f1d641049fa7]]"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Do Task

Execute an existing task autonomously to completion via Orbh. No interactive stages — blockers use deferred questions, progress is reported via the Orbh interface.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the run. Its behaviours do some edits of the task for you. The steps below do not change.

- Start the workflow with `flint shard invoke proj do_task --headless --input task="(Task) NNN Title"`. When the task is `todo`, the behaviour `task-open` sets `in-progress`, adds the session to `orbh-sessions`, and pins the task. Then these edits of step 1 are done.
- Never pass `--with task-confirm`. Only a person confirms a task. After step 4 the task stays in `review`.
- To stop the work for now, return with `flint orbh session return --with task-defer="<reason>" "<result>"`. The script `task-defer` sets `deferred` and logs the reason.
- When a task script refuses, the return stops and prints the reason. Return again without `--with task-defer`, and put the reason in the result.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `setup`, `execute`, `report`, and `complete`. `flint shard step` shows the current step. An invocation opens no Orbh procedure: use `flint shard step`, not `flint orbh procedure step`.
- The `report` step calls the Reports shard: `flint shard invoke rpt create --input source="(Task) NNN Title"` opens the report as a child of the task. When the task needs no report, run `flint shard step skip report --reason "<why>"`.
- When no invocation is open, do the edits of each step by hand.

# Input

- Task specification (an existing Task artifact)
- (Optional) Context or aiding prompts on how to complete the task
- (Optional) Refinement pass — if the task has prior session history, continue from where the last session left off rather than restarting

# Actions

## 1. Setup

- If `ORBH_SESSION_ID` is set, add the final task path to this session's Markdown pins:
  ```bash
  if [ -n "${ORBH_SESSION_ID:-}" ]; then
    flint helper pins add "Mesh/Types/Tasks/(Task) NNN Title.md"
  fi
  ```
  Replace the example with the actual path relative to the Flint root. Use the path after any task rename.
  Keep the pin after completion. Use `add` to preserve other pins. Artifact tracking remains a separate action.
- Read the task fully — frontmatter, context, requirements, definition of done, task log, notes
- Set task status to `in-progress`
- Set Orbh interface:
  ```bash
  flint orbh session <id> set phase "reading-task"
  flint orbh session <id> set progress "0/<N> requirements"
  ```
- If this is a refinement pass (task has prior session entries in the task log), review what was already done and pick up from there

## 2. Execute

- Implement the task requirements end to end
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` to `- [x]`)
- Update the Orbh interface as you progress:
  ```bash
  flint orbh session <id> set phase "implementing"
  flint orbh session <id> set progress "<done>/<total> requirements"
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

If the task has a `git-repos` field, you must commit your changes as WIP commits before completing. See [[dev-knw-proj-wip_commits]] for the full convention. In short, for each repo in `git-repos`:

1. Resolve the repo path (wikilink via `flint resolve codebase`, or use the plain name/path)
2. `cd` to the repo
3. `git add` only the files you edited (never `git add -A`)
4. `git commit` with subject `[OR] wip: <Flint Name>/(Task) NNN Name` and a short paragraph in the body describing what changed (use a heredoc for multi-line). Flint name without the (Flint) prefix.
5. Record the commit SHA in the task's `wip-commits` field (annotate with repo name in parens if multiple repos)
6. `cd` back to the Flint root

If there is no `git-repos` field, skip this step.

### Checking the Views

If the task has a `git-repos` field and `flint shard list` shows `ite`, follow [[sk-ite-check_after_task]] after the WIP commits. The skill first emits the event `task.finished` with the changed files, so that the agent of each program keeps its map true. When no standing process of a program takes the event, the skill checks the parts and the views of that program itself. The skill is an aid: it never blocks the review or the close of the task. When the commits are on a worktree branch that is not landed, write `ITE: run sk-ite-check_after_task after the landing` in the Task Log and in the result.

## 3. Report

- Make a report when the task asks for one, or when the work found something to keep (a finding, a measurement, or a decision with its reasons). Else skip this step.
- When `flint shard list` shows `rpt`, use [[wkfl-rpt-create]] of the Reports shard. Give the task as the source of the report. Add the report to `artifacts-created` of the task.
- With an open invocation, the report runs as a child of the task: `flint shard invoke rpt create --input source="(Task) NNN Title"`. When the report is closed, set the output of the task: `flint shard invocations set-output report="(Report) NNN Title"`. To skip the step, run `flint shard step skip report --reason "<why>"`.
- Then proceed to step 4

## 4. Complete

- Verify all requirement and definition-of-done checkboxes are ticked
- Set task status to `review`
- Add a final Task Log entry summarising the work done
- Return your result:
  ```bash
  flint orbh session <id> set phase "complete"
  flint orbh session <id> return "Completed task (Task) NNN. <brief summary of what was done>. Moved to review."
  ```

# Output

- Task moved to `review` status with all checkboxes ticked
- Task Log updated with session progress
- Orbh result returned with completion summary
