---
orbh-sessions:
  - "[[87347e6b-2363-4434-9a98-f1d641049fa7]]"
  - "[[f562483c-6afe-404a-98eb-a049503a241e]]"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create and Do Task

Create a task and immediately execute it in a single workflow. This is an **execution** workflow — the task is created and worked to completion without a separate planning phase.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Do not wait for a person.
> - Report progress with the session keys: `flint orbh session set phase <phase>` and `flint orbh session set progress "<done>/<total> requirements"`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - Track each artifact that you create or change: `flint orbh artifact "<path of the artifact>"`.
> - Never pass `--with task-confirm`. Only a person confirms a task. At the end, the task stays in `review`.
> - End the turn with `flint orbh session return --finish "<result>"`.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the run. Its behaviours do some edits of the task for you. The stages below do not change.

- Start the workflow with `flint shard invoke proj create_and_do_task`. The task does not exist yet, so give no task input.
- The mode comes from the Orbh session. A headless or subagent session runs in the headless mode and follows the `> [!headless]` callouts. In the headless mode, the invocation skips the step `close` at the open, because only a person confirms a task. `flint shard step` shows the step that the mode skipped.
- After Stage 1, set the task input: `flint shard invocations set-input <id> task="(Task) NNN Title"`. The hint after each write prints the command with the id of the invocation. Use the title after the rename. The close behaviours find the task through this input.
- **Readiness.** `set-input` checks the task before it writes: the task must exist, be a Task, and not be `done`, `deprecated`, `superseded`, or `reviewing`. Else it refuses with `input-not-ready` and the ways. For a `reviewing` task, a review runs now: wait for it to end, or ask the person. A new task in `in-progress` passes. Do not edit the task by hand to pass the check: tell the person, ask, then run the way that the person picks.
- **State entry.** The state of the task never settles the step `create`: a stub or a half-created task exists too. A completed `create` comes from continuation: a later `create_and_do_task` on the same task copies the settled steps of an earlier one that did not close `done`. After that copy, `invoke` settles each next step that the state of the task proves done: `work` and `report` on a task in `review`, and also `review` on a task in `reviewed` (then the invocation starts at `close`, the confirm of the person).
- **The next workflow.** In a headless session, the `done` close of the invocation prints the next command: `proj review_task` on the task. An interactive session keeps the confirm of the person (Stage 5).
- **Toward a review.** When the invocation was opened with `--toward 'proj review_task'` (the output of `invoke` and `flint shard step` show it), the person asked for a review, not for the confirm. Do not ask for the confirm. After Stage 4 sets `review`, skip the step `close`: `flint shard step skip close --reason 'toward review_task'`. Then close the invocation: `flint shard invocations close --outcome done`. The close prints the `review_task` command.
- At Stage 5: when the invocation is open and the person confirms, the close is `flint orbh close --with task-confirm`. In a session that stays open, use `flint orbh session return --finish --with task-confirm`. The script `task-close` does the edits of Stage 5: `done`, `completed`, the Task Log line, and the increment log line.
- Pass `--with task-confirm` only when the person asks for it in the current message.
- To stop the work for now, close or return with `--with task-defer="<reason>"`. The script `task-defer` sets `deferred` and logs the reason.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `create`, `work`, `report`, `review`, and `close`. `flint shard step` shows the current step. An invocation opens no Orbh procedure: use `flint shard step`, not `flint orbh procedure step`.
- Outside an Orbh session (no `ORBH_SESSION_ID`), give `--invocation <id>` to `flint shard step`, for example `flint shard step done <step> --invocation <id> --evidence "<…>"`. The hint after each write prints the id.
- The `report` step calls the Reports shard. `flint shard invoke rpt create --input source="(Task) NNN Title"` opens the report as a child of the task. When the task needs no report, run `flint shard step skip report --reason "<why>"`.
- Inside another open frame (for example a notepad), the task is a child frame, and the session continues after the task. Then do not close the session. At Stage 5, the task must be in `review` (also after `--skip-review`). When the person confirms, run `flint shard proj task-close "(Task) NNN Title"`, mark the `close` step done, and close the invocation: `flint shard invocations close <id> --outcome done`. The parent frame is then the current frame again.
- When no invocation is open, do the edits of each stage by hand.

> [!headless]
> - After Stage 1, set the task input as above. The return behaviours find the task through this input. When `set-input` refuses with `input-not-ready`, return the refusal as the blocker.
> - When a continued invocation opens on a task in `reviewed`, the copy and the state settle each step up to `review`, and the mode skips `close`. No step is open. Do not change the task. Close the invocation with `--outcome done`, and return: the task waits for the confirm of a person. The close says that `review_task` is not ready, because the task is not in `review`. That is correct.
> - At the end of Stage 4, close the invocation with `--outcome done` before the return. The close prints the `review_task` command: put it in the result. A person who wants to confirm the task with no review runs `flint shard proj task-close "(Task) NNN Title"`.
> - To stop the work for now, return with `flint orbh session return --with task-defer="<reason>" "<result>"`. The script `task-defer` sets `deferred` and logs the reason.
> - When a task script refuses, the return stops and prints the reason. Return again without `--with task-defer`, and put the reason in the result.

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

> [!headless]
> - The parent in the `from` field comes from the prompt, not from a person.
> - Set `flint orbh session set phase creating-task`, and track the task: `flint orbh artifact "Mesh/Types/Tasks/(Task) NNN Title.md"`.

## Stage 2: Task Work

- Read the task and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, commit if needed (see below) and proceed to Stage 3

> [!headless]
> - Set `flint orbh session set phase implementing`, and update `flint orbh session set progress "<done>/<total> requirements"` after each requirement.
> - Track each artifact that you create or change: `flint orbh artifact "<path of the artifact>"`.
> - When you are blocked, there is no person to tell. Log the blocker in the Task Log, set the task to `blocked`, set `phase blocked`, and use a deferred request: `flint orbh request "$ORBH_SESSION_ID" "<the question that you need answered>"`. When the session resumes with the answer, continue. A subagent session asks no person: it returns the blocker and the question to its dispatcher.

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
- With an open invocation, the report runs as a child of the task. The `report` step gives the command: `flint shard invoke rpt create --input source="(Task) NNN Title"`. When the report is closed, set the output of the task: `flint shard invocations set-output <id> report="(Report) NNN Title"`. To skip the stage, run `flint shard step skip report --reason "<why>"`.
- Then proceed to Stage 4

> [!headless]
> The report runs in the headless mode too, with the same command: follow the `> [!headless]` callouts of [[wkfl-rpt-create]]. Its review is a self-check, and no step waits for a person.

## Stage 4: Task Review

*If `--skip-review` was passed, set status to `review` (the first action of this stage), skip the rest of this stage, and proceed directly to Stage 5. With an open invocation, run `flint shard step skip review --reason "--skip-review"`. The task must be in `review` before the close: `task-close` accepts only `review`, `reviewed`, or `done`.*

- Set status to `review`. Never move a `reviewing` or `reviewed` task back to `review`: a `reviewing` task has a review that runs now, and a `reviewed` task goes on to Stage 5.
- Update the task file with final progress
- Provide the user with a completion summary
- Converse to refine — if the user requests changes, capture them in the task and execute them
- Once the user confirms, proceed to Stage 5
- When the invocation was opened with `--toward 'proj review_task'`, do not ask for the confirm. Give the summary, mark the step `review` done, skip the step `close` (`flint shard step skip close --reason 'toward review_task'`), and close the invocation with `--outcome done`. The close prints the `review_task` command. Do not do Stage 5.

> [!headless]
> Do not wait for a person, and do not do Stage 5. `--skip-review` does not apply.
> - Make sure that each requirement and definition-of-done checkbox is ticked.
> - Set the status to `review` (never back from `reviewing` or `reviewed`), and add a last Task Log entry that sums up the work.
> - Write the summary into the result, not to a person. Set `flint orbh session set phase complete`.
> - With an open invocation, mark the step `review` done, and close the invocation: `flint shard invocations close --outcome done`. The step `close` was skipped at the open, so the close is allowed. It prints the next command, `flint shard invoke proj review_task --input task=…`.
> - Return: `flint orbh session return --finish "Created and completed task (Task) NNN <title>. <summary of the work>. Moved to review. Next: <the review_task command>."`
> - Never pass `--with task-confirm`.

## Stage 5: Close

*When the invocation was opened with `--toward 'proj review_task'`, skip this stage: a reviewer takes the task (Stage 4 says how).*

- Set status to `done`
- Set the `completed` date (ISO 8601)
- If the task has a `from` that points to an increment, update that increment's log with a completion entry

> [!headless]
> A headless session does not do this stage. Only a person confirms a task. The invocation skips the step `close` at the open.

# Output

- Completed task in `done` status
- Increment log updated (if `from` points to an increment)

> [!headless]
> - A new task in `review`, with all checkboxes ticked
> - The Task Log has the creation and the progress of the session
> - The Orbh result has the summary of the work
