---
orbh-sessions:
  - "[[87347e6b-2363-4434-9a98-f1d641049fa7]]"
  - "[[f562483c-6afe-404a-98eb-a049503a241e]]"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Do Task

Execute an existing task through to completion. This is an **execution** workflow — the task already has a specification, and this workflow works it to done.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Do not wait for a person.
> - Report progress with the session keys: `flint orbh session set phase <phase>` and `flint orbh session set progress "<done>/<total> requirements"`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - Track each artifact that you create or change: `flint orbh artifact "<path of the artifact>"`.
> - Never pass `--with task-confirm`. Only a person confirms a task. At the end, the task stays in `review`.
> - End the turn with `flint orbh session return --finish "<result>"`.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the run. Its behaviours do some edits of the task for you. The stages below do not change.

- Start the workflow with `flint shard invoke proj do_task --input task="(Task) NNN Title"`. When the task is `todo`, the behaviour `task-open` sets `in-progress`, adds the session to `orbh-sessions`, and pins the task. Then these edits of Stage 1 are done.
- The mode comes from the Orbh session. A headless or subagent session runs in the headless mode and follows the `> [!headless]` callouts. In the headless mode, the invocation skips the step `close` at the open, because only a person confirms a task. `flint shard step` shows the step that the mode skipped.
- **Readiness.** `invoke` checks the task before any write. The task must exist, be a Task, and not be `done`, `deprecated`, `superseded`, or `reviewing`. Else `invoke` refuses with `input-not-ready`: the reason, and the ways to make the task ready. For a `done` task, the way is a new task that continues it ([[dev-sk-proj-supersede_task]]). For a `reviewing` task, a review runs now: wait for it to end, or ask the person.
- **When `invoke` refuses.** Do not edit the task by hand to pass the check. In an interactive session, tell the person the state of the task, the state that the workflow needs, and each way. Ask, then run the way that the person picks. `--not-ready '<why>'` opens the invocation anyway: pass it only when the person asks for it. A headless session does not choose: it returns the refusal as its blocker.
- **State entry.** At the open, `invoke` settles each leading step that the state of the task proves done. On a task in `review`, the steps `work` and `report` are done, and the invocation starts at `review`. On a task in `reviewed`, the step `review` is done too, and the invocation starts at `close`: the confirm of the person. The output of `invoke` names each step that the state settled.
- **Continuation.** A later `do_task` on the same task links to the earlier invocation on that task. When the earlier invocation is a `do_task` that did not close `done` (for example, its session closed), the new invocation copies its settled steps and its outputs, and it continues from there. `--fresh` copies nothing. When the earlier invocation is still open in a live session, `invoke` refuses (`continue-open`): close that invocation, or use `--fresh`.
- **The next workflow.** In a headless session, the `done` close of the invocation prints the next command: `proj review_task` on the task, so that a reviewer takes it. An interactive session keeps the confirm of the person (Stage 4), and its close prints no next workflow.
- **Toward a review.** When the invocation was opened with `--toward 'proj review_task'` (the output of `invoke` and `flint shard step` show it), the person asked for a review, not for the confirm. Do not ask for the confirm. After Stage 3 sets `review`, skip the step `close`: `flint shard step skip close --reason 'toward review_task'`. Then close the invocation: `flint shard invocations close --outcome done`. The close prints the `review_task` command. `review_task` gives this way when it refuses a task that is not in `review`.
- At Stage 4: when the invocation is open and the person confirms, the close is `flint orbh close --with task-confirm`. In a session that stays open, use `flint orbh session return --finish --with task-confirm`. The script `task-close` does the edits of Stage 4: `done`, `completed`, the Task Log line, and the increment log line.
- Pass `--with task-confirm` only when the person asks for it in the current message.
- To stop the work for now, close or return with `--with task-defer="<reason>"`. The script `task-defer` sets `deferred` and logs the reason.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `work`, `report`, `review`, and `close`. `flint shard step` shows the current step. An invocation opens no Orbh procedure: use `flint shard step`, not `flint orbh procedure step`.
- Outside an Orbh session (no `ORBH_SESSION_ID`), give `--invocation <id>` to `flint shard step`, for example `flint shard step done <step> --invocation <id> --evidence "<…>"`. The hint after each write prints the id.
- The `report` step calls the Reports shard. `flint shard invoke rpt create --input source="(Task) NNN Title"` opens the report as a child of the task. When the task needs no report, run `flint shard step skip report --reason "<why>"`.
- Inside another open frame (for example a notepad), the task is a child frame, and the session continues after the task. Then do not close the session. At Stage 4, when the person confirms, run `flint shard proj task-close "(Task) NNN Title"`, mark the `close` step done, and close the invocation: `flint shard invocations close <id> --outcome done`. The parent frame is then the current frame again.
- When no invocation is open, do the edits of each stage by hand.

> [!headless]
> - When `invoke` refuses with `input-not-ready`, do not choose a way, and do not edit the task. Return the refusal as the blocker: `flint orbh session return --finish "<the refusal and its ways>"`.
> - On a task in `reviewed`, the state settles `work`, `report`, and `review` at the open, and the mode skips `close`. No step is open. Do not change the task. Close the invocation with `--outcome done`, and return: the task waits for the confirm of a person. The close says that `review_task` is not ready, because the task is not in `review`. That is correct.
> - At the end of Stage 3, close the invocation with `--outcome done` before the return. The close prints the `review_task` command: put it in the result. A person who wants to confirm the task with no review runs `flint shard proj task-close "(Task) NNN Title"`.
> - To stop the work for now, return with `flint orbh session return --with task-defer="<reason>" "<result>"`. The script `task-defer` sets `deferred` and logs the reason.
> - When a task script refuses, the return stops and prints the reason. Return again without `--with task-defer`, and put the reason in the result.

# Input

- Task specification (an existing Task artifact)
- (Optional) Context or aiding prompts on how to complete the task

# Actions

## Stage 1: Task Work

- If `ORBH_SESSION_ID` is set, add the final task path to this session's Markdown pins:
  ```bash
  if [ -n "${ORBH_SESSION_ID:-}" ]; then
    flint helper pins add "Mesh/Types/Tasks/(Task) NNN Title.md"
  fi
  ```
  Replace the example with the actual path relative to the Flint root. Use the path after any task rename.
  Keep the pin after completion. Use `add` to preserve other pins. Artifact tracking remains a separate action.
- Set status to `in-progress`
- Read the task fully and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision or external dependency, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, commit if needed (see below) and proceed to Stage 2

> [!headless]
> - Read the task fully: the frontmatter, the context, the requirements, the definition of done, the Task Log, and the notes.
> - At the start, set `flint orbh session set phase reading-task` and `flint orbh session set progress "0/<N> requirements"`. While you implement, set `phase implementing`, and update `progress` after each requirement.
> - Refinement pass: when the Task Log has entries of earlier sessions, read what they did, and continue from that point. Do not start again.
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

## Stage 2: Report

- Make a report when the task asks for one, or when the work found something to keep (a finding, a measurement, or a decision with its reasons). Else skip this stage.
- When `flint shard list` shows `rpt`, use [[wkfl-rpt-create]] of the Reports shard. Give the task as the source of the report. Add the report to `artifacts-created` of the task.
- With an open invocation, the report runs as a child of the task. The `report` step gives the command: `flint shard invoke rpt create --input source="(Task) NNN Title"`. When the report is closed, set the output of the task: `flint shard invocations set-output <id> report="(Report) NNN Title"`. To skip the stage, run `flint shard step skip report --reason "<why>"`.
- Then proceed to Stage 3

> [!headless]
> The report runs in the headless mode too, with the same command: follow the `> [!headless]` callouts of [[wkfl-rpt-create]]. Its review is a self-check, and no step waits for a person.

## Stage 3: Task Review

- Set status to `review`. Never move a `reviewing` or `reviewed` task back to `review`: a `reviewing` task has a review that runs now, and a `reviewed` task goes on to Stage 4.
- Update the task file with final progress
- Provide the user with a completion summary
- Converse to refine — if the user requests changes, capture them in the task and execute them
- Once the user confirms, proceed to Stage 4
- When the invocation was opened with `--toward 'proj review_task'`, do not ask for the confirm. Give the summary, mark the step `review` done, skip the step `close` (`flint shard step skip close --reason 'toward review_task'`), and close the invocation with `--outcome done`. The close prints the `review_task` command. Do not do Stage 4.

> [!headless]
> Do not wait for a person, and do not do Stage 4.
> - Make sure that each requirement and definition-of-done checkbox is ticked.
> - Set the status to `review` (never back from `reviewing` or `reviewed`), and add a last Task Log entry that sums up the work.
> - Write the summary into the result, not to a person. Set `flint orbh session set phase complete`.
> - With an open invocation, mark the step `review` done, and close the invocation: `flint shard invocations close --outcome done`. The step `close` was skipped at the open, so the close is allowed. It prints the next command, `flint shard invoke proj review_task --input task=…`.
> - Return: `flint orbh session return --finish "Completed task (Task) NNN. <summary of the work>. Moved to review. Next: <the review_task command>."`
> - Never pass `--with task-confirm`.

## Stage 4: Close

*When the invocation was opened with `--toward 'proj review_task'`, skip this stage: a reviewer takes the task (Stage 3 says how).*

- Set status to `done`
- Set the `completed` date (ISO 8601)
- If the task has a `from` that points to an increment, update that increment's log with a completion entry

> [!headless]
> A headless session does not do this stage. Only a person confirms a task. The invocation skips the step `close` at the open.

# Output

- Completed task in `done` status
- Increment log updated (if `from` points to an increment)

> [!headless]
> - The task is in `review`, with all checkboxes ticked
> - The Task Log has the progress of the session
> - The Orbh result has the summary of the work
