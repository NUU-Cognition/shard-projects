---
orbh-sessions:
  - "[[87347e6b-2363-4434-9a98-f1d641049fa7]]"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create and Do Task

Create a task and immediately execute it in a single workflow. This is an **execution** workflow — the task is created and worked to completion without a separate planning phase.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the run. Its behaviours do some edits of the task for you. The stages below do not change.

- Start the workflow with `flint shard invoke proj create_and_do_task`. The task does not exist yet, so give no task input.
- After Stage 1, set the task input: `flint shard invocations set-input task="(Task) NNN Title"`. Use the title after the rename. The close behaviours find the task through this input.
- At Stage 5: when the invocation is open and the person confirms, the close is `flint orbh close --with task-confirm`. In a session that stays open, use `flint orbh session return --finish --with task-confirm`. The script `task-close` does the edits of Stage 5: `done`, `completed`, the Task Log line, and the increment log line.
- Pass `--with task-confirm` only when the person asks for it in the current message.
- To stop the work for now, close or return with `--with task-defer="<reason>"`. The script `task-defer` sets `deferred` and logs the reason.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `create`, `work`, `report`, `review`, and `close`. `flint shard step` shows the current step. An invocation opens no Orbh procedure: use `flint shard step`, not `flint orbh procedure step`.
- The `report` step calls the Reports shard. `flint shard invoke rpt create --input source="(Task) NNN Title"` opens the report as a child of the task. When the task needs no report, run `flint shard step skip report --reason "<why>"`.
- Inside another open frame (for example a notepad), the task is a child frame, and the session continues after the task. Then do not close the session. At Stage 5, when the person confirms, run `flint shard proj task-close "(Task) NNN Title"`, mark the `close` step done, and close the invocation: `flint shard invocations close <id> --outcome done`. The parent frame is then the current frame again.
- When no invocation is open, do the edits of each stage by hand.

# Input

- Context of a task
- (Optional) Aiding prompts and instructions on how to complete the task
- (Optional) `--skip-review` — skip Stage 4 (Task Review) and go straight from the report to close

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `from` field if a parent context is known. The `from` field is optional — leave it blank unless a parent is clear:
  1. If user specifies a parent (increment or mission), use that
  2. If the task is part of a mission, link to the mission
  3. If the task clearly relates to an active increment, use that
  4. Otherwise, leave `from` blank
- Set status to `in-progress` (since we're immediately executing)
- **Rename the file** to match the chosen title. If the file was created as a stub with a placeholder name (e.g. `(Task) 589 New Task.md`), rename it to `(Task) 589 <Chosen Title>.md` so the filename reflects the actual task content.
- If `ORBH_SESSION_ID` is set, add the final task path to this session's Markdown pins:
  ```bash
  if [ -n "${ORBH_SESSION_ID:-}" ]; then
    flint helper pins add "Mesh/Types/Tasks/(Task) NNN Title.md"
  fi
  ```
  Replace the example with the actual path relative to the Flint root. Use the path after any task rename.
  Keep the pin after completion. Use `add` to preserve other pins. Artifact tracking remains a separate action.
- Leave priority and due date blank unless specified
- Once created, proceed to Stage 2

## Stage 2: Task Work

- Read the task and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, commit if needed (see below) and proceed to Stage 3

### Committing Repo Work

If the task has a `git-repos` field, you must commit your changes as WIP commits before moving to review. See [[dev-knw-proj-wip_commits]] for the full convention. In short, for each repo in `git-repos`:

1. Resolve the repo path (wikilink via `flint resolve codebase`, or use the plain name/path)
2. `cd` to the repo
3. `git add` only the files you edited (never `git add -A`)
4. `git commit` with subject `[OR] wip: <Flint Name>/(Task) NNN Name` and a short paragraph in the body describing what changed (use a heredoc for multi-line). Flint name without the (Flint) prefix.
5. Record the commit SHA in the task's `wip-commits` field (annotate with repo name in parens if multiple repos)
6. `cd` back to the Flint root

If there is no `git-repos` field, skip this step.

### Checking the Views

If the task has a `git-repos` field and `flint shard list` shows `ite`, follow [[sk-ite-check_after_task]] after the WIP commits. The skill first emits the event `task.finished` with the changed files, so that the agent of each program keeps its map true. When no standing process of a program takes the event, the skill checks the parts and the views of that program itself. The skill is an aid: it never blocks the review or the close of the task. When the commits are on a worktree branch that is not landed, write `ITE: run sk-ite-check_after_task after the landing` in the Task Log and in the result.

## Stage 3: Report

- Make a report when the task asks for one, or when the work found something to keep (a finding, a measurement, or a decision with its reasons). Else skip this stage.
- When `flint shard list` shows `rpt`, use [[wkfl-rpt-create]] of the Reports shard. Give the task as the source of the report. Add the report to `artifacts-created` of the task.
- With an open invocation, the report runs as a child of the task. The `report` step gives the command: `flint shard invoke rpt create --input source="(Task) NNN Title"`. When the report is closed, set the output of the task: `flint shard invocations set-output report="(Report) NNN Title"`. To skip the stage, run `flint shard step skip report --reason "<why>"`.
- Then proceed to Stage 4

## Stage 4: Task Review

*If `--skip-review` was passed, skip this stage and proceed directly to Stage 5. With an open invocation, run `flint shard step skip review --reason "--skip-review"`.*

- Set status to `review`
- Update the task file with final progress
- Provide the user with a completion summary
- Converse to refine — if the user requests changes, capture them in the task and execute them
- Once the user confirms, proceed to Stage 5

## Stage 5: Close

- Set status to `done`
- Set the `completed` date (ISO 8601)
- If the task has a `from` that points to an increment, update that increment's log with a completion entry

# Output

- Completed task in `done` status
- Increment log updated (if `from` points to an increment)
