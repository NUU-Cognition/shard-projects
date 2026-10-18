> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Review Task

Quality assurance review of a completed task. Verify that all requirements are met, checkboxes are accurate, and the work actually delivers what the task specified.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Fix the straightforward issues inline, and close the review. Ask only for a decision that you cannot make.
> - Report progress with the session keys: `flint orbh session set phase <phase>` and `flint orbh session set progress "<verified>/<total> checkboxes verified"`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - End the turn with `flint orbh session return --finish "<result>"`.

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

> [!headless]
> - Set `flint orbh session set phase complete`, and return: `flint orbh session return --finish "Reviewed task (Task) NNN. <N items verified, M fixed inline>. Status set to reviewed."`

# Output

- Task verified as complete with all checkboxes confirmed
- Task status set to `reviewed` with completion date

> [!headless]
> - The Orbh result has the summary of the review
