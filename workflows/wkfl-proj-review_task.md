This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Review Task

Quality assurance review of a completed task. Verify that all requirements are met, checkboxes are accurate, and the work actually delivers what the task specified.

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

## Stage 2: Resolve

- If all items passed verification, skip to Stage 3
- For items that failed:
  - Fix the issue inline if it's straightforward — make the change, verify it, tick the checkbox, and log the fix under a "Review fixes" heading in the Task Log
  - Flag it to the user if it requires a decision or significant rework
- Continue until all checkboxes are resolved or the user decides to defer remaining items

Once the user confirms resolution is complete, proceed to Stage 3.

## Stage 3: Close

- Ensure all requirement and definition-of-done checkboxes are ticked
- Set status to `done`
- Set the `completed` date (ISO 8601)
- Add a final Task Log entry recording the review outcome

# Output

- Task verified as complete with all checkboxes confirmed
- Task status set to `done` with completion date
