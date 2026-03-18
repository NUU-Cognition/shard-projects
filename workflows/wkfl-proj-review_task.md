This workflow belongs to the Projects shard. Ensure you have the @init-proj.md in context before continuing.

# Workflow: Review Task

Quality assurance review of a completed task. Verify that all requirements are met, checkboxes are accurate, and the work actually delivers what the task specified.

# Input

- Task specification (Task) — should be in `review` or `done` status

# Actions

## Stage 1: Verify

- Read the task file fully — frontmatter, context, requirements, definition of done, task log, and notes
- For each requirement checkbox that is ticked:
  - Verify the work was actually done (check files, code, or other artifacts referenced)
  - If a checkbox is ticked but the work is missing or incomplete, untick it and note the gap
- For each definition-of-done checkbox that is ticked:
  - Verify the criterion is genuinely satisfied
  - If not, untick it and note what's missing
- **Make contact with reality where possible.** If the task involves code and you can reasonably run a build, execute tests, try CLI commands, or test output in a temp directory — do that instead of just reading the code. Prefer execution over inspection when it's feasible, but don't force it if the setup is impractical or out of scope.
- Check for any unchecked items that are actually complete and tick them
- Present findings to the user:
  - Items verified as complete
  - Items that failed verification (with specifics)
  - Any items that were missed but are actually done

Once the user has reviewed the findings, progress to the next stage.

## Stage 2: Resolve

- If all items passed verification, skip to Stage 3
- For items that failed verification:
  - Fix the issue if it's straightforward
  - Flag it to the user if it requires a decision or significant rework
  - Tick the checkbox once the fix is confirmed
- Update the task log with what was found and fixed during review
- Continue until all checkboxes are resolved or the user decides to defer remaining items

- If the user asks to fix any issues, simply do so by [[wkfl-proj-do_task]] & record progress inside the task file under a review heading under the task log. 

Once the user confirms resolution is complete, progress to the next stage.

## Stage 3: Close

- Ensure all requirement and definition-of-done checkboxes are ticked
- Update the task status to `done`
- Set the `completed` date (ISO 8601)
- Add a final task log entry recording the review outcome

# Output

- Task verified as complete with all checkboxes confirmed
- Task status set to `done` with completion date
