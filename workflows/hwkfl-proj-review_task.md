This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Review Task

Autonomous QA review of a completed task via OrbH. Verify all requirements are met, fix straightforward issues inline, and close the task — or defer to the human for decisions.

# Input

- Task specification (should be in `review` status)

# Actions

## 1. Setup

- Read the task fully — frontmatter, context, requirements, definition of done, task log, notes
- Set task status to `reviewing`
- Set OrbH interface:
  ```bash
  flint orb set <id> phase "verifying"
  flint orb set <id> progress "0/<N> checkboxes verified"
  ```

## 2. Verify

For each ticked requirement and definition-of-done checkbox:
- Verify the work was actually done (check files, code, or other artifacts referenced)
- **Make contact with reality where possible.** If the task involves code, run builds, execute tests, try CLI commands. Prefer execution over inspection.
- If ticked but work is missing or incomplete, untick it and note the gap

For each unticked item:
- Check if it's actually complete and tick it if so

Update progress as you go:
```bash
flint orb set <id> progress "<verified>/<total> checkboxes verified"
```

## 3. Resolve

- If all items passed verification, proceed to step 4
- For items that failed:
  - Fix the issue inline if it's straightforward — make the change, verify it, tick the checkbox, and log the fix in the Task Log under a "Review fixes" heading
  - If a fix requires a human decision or significant rework, use a deferred question:
    ```bash
    flint orb request <id> "<describe the issue and what decision is needed>"
    ```
- Update OrbH interface:
  ```bash
  flint orb set <id> phase "resolving"
  ```

## 4. Close

- Ensure all requirement and definition-of-done checkboxes are ticked
- Set task status to `done`
- Set the `completed` date (ISO 8601)
- Add a final Task Log entry recording the review outcome
- Return your result:
  ```bash
  flint orb set <id> phase "complete"
  flint orb return <id> "Reviewed and closed task (Task) NNN. <summary: N items verified, M fixed inline>."
  ```

# Output

- Task verified as complete with all checkboxes confirmed
- Task status set to `done` with completion date
- OrbH result returned with review summary
