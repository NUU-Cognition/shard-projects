> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Review Task

Quality assurance review of a completed task. Verify that all requirements are met, checkboxes are accurate, and the work actually delivers what the task specified.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Fix the straightforward issues inline, and close the review. Ask only for a decision that you cannot make.
> - Report progress with the session keys: `flint orbh session set phase <phase>` and `flint orbh session set progress "<verified>/<total> checkboxes verified"`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - End the turn with `flint orbh session return --finish "<result>"`.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the review. The stages below do not change.

- Start the workflow with `flint shard invoke proj review_task --input task="(Task) NNN Title"`.
- The mode comes from the Orbh session. A headless or subagent session runs in the headless mode and follows the `> [!headless]` callouts. Each step has a hint for each mode. `flint shard step` shows the current step and each step that the mode skipped.
- **Readiness.** The task must be in `review`. `invoke` checks it before any write. Else `invoke` refuses with `input-not-ready`, and it gives the ways:
  - from `todo`, `in-progress`, `blocked`, or `deferred`: finish the work first with `flint shard invoke proj do_task --input task='(Task) NNN Title' --toward 'proj review_task'`. That `do_task` does not ask for the confirm of the person: after it sets `review`, it skips its step `close` and closes `done`. Its close checks `review_task` again and prints its command.
  - from `reviewing`: another review runs now. Wait until it ends.
- **When `invoke` refuses.** Do not edit the task by hand to pass the check. In an interactive session, tell the person the state of the task, the state that the review needs, and each way. Ask, then run the way that the person picks. `--not-ready '<why>'` opens the review anyway: pass it only when the person asks for it. A headless session does not choose: it returns the refusal as its blocker.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `verify`, `resolve`, and `close`. Outside an Orbh session (no `ORBH_SESSION_ID`), give `--invocation <id>` to `flint shard step`. The hint after each write prints the id.
- After Stage 3, close the invocation: `flint shard invocations close <id> --outcome done`. The `reviewed → done` move stays a manual action of a person.
- When no invocation is open, follow the stages with no record.

> [!headless]
> - When `invoke` refuses with `input-not-ready`, do not choose a way: return the refusal as the blocker.
> - Close the invocation with `--outcome done` before the return.

# Input

- Task specification (should be in `review` status)

# Actions

## Stage 1: Verify

- Set status to `reviewing`
- Read the task file fully — frontmatter, context, requirements, definition of done, task log, and notes
- For each ticked requirement checkbox:
  - Verify the work was actually done (check files, code, or other artifacts referenced)
  - If ticked but work is missing or incomplete, untick it and note the gap
- For each ticked definition-of-done checkbox:
  - Verify the criterion is genuinely satisfied
  - If not, untick it and note what's missing
- **Make contact with reality where possible.** If the task involves code and you can reasonably run a build, execute tests, try CLI commands, or test output — do that instead of just reading the code. Prefer execution over inspection when feasible.
- Check for any unchecked items that are actually complete and tick them
- Present findings to the user:
  - Items verified as complete
  - Items that failed verification (with specifics)
  - Items that were missed but are actually done

Once the user has reviewed the findings, proceed to Stage 2.

> [!headless]
> - At the start, set `flint orbh session set phase verifying` and `flint orbh session set progress "0/<N> checkboxes verified"`. Update `progress` as you verify.
> - Do not present the findings to a person. Keep them for the Task Log and the result, and go on to Stage 2.

## Stage 2: Resolve

- If all items passed verification, skip to Stage 3
- For items that failed:
  - Fix the issue inline if it's straightforward — make the change, verify it, tick the checkbox, and log the fix under a "Review fixes" heading in the Task Log
  - Flag it to the user if it requires a decision or significant rework
- Continue until all checkboxes are resolved or the user decides to defer remaining items

Once the user confirms resolution is complete, proceed to Stage 3.

> [!headless]
> - Set `flint orbh session set phase resolving`.
> - When a fix needs a human decision or significant rework, use a deferred request: `flint orbh request "$ORBH_SESSION_ID" "<the issue and the decision that you need>"`. A subagent session asks no person: it returns the issue and the question to its dispatcher.
> - Do not wait for a confirmation. When each checkbox is resolved, go on to Stage 3.

## Stage 3: Close

- Ensure all requirement and definition-of-done checkboxes are ticked
- Set status to `reviewed`
- Set the `completed` date (ISO 8601)
- Add a final Task Log entry recording the review outcome
- The `reviewed → done` transition is a manual human action — do not set the task to `done`
- With an open invocation, close it with `--outcome done`

> [!headless]
> - Set `flint orbh session set phase complete`, and return: `flint orbh session return --finish "Reviewed task (Task) NNN. <N items verified, M fixed inline>. Status set to reviewed."`

# Output

- Task verified as complete with all checkboxes confirmed
- Task status set to `reviewed` with completion date

> [!headless]
> - The Orbh result has the summary of the review
