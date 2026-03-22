This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create and Do Task

Create a task and immediately execute it in a single workflow. This is an **execution** workflow — the task is created and worked to completion without a separate planning phase.

# Input

- Context of a task
- (Optional) Aiding prompts and instructions on how to complete the task
- (Optional) `--skip-review` — skip Stage 3 and go straight from work to close

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment using `[[Hyperlink]]` syntax. All tasks must belong to an increment. To determine the increment:
  1. If user specifies an increment, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the current adhoc increment (e.g., `6.A`)
- Set status to `in-progress` (since we're immediately executing)
- Leave priority and due date blank unless specified
- Once created, proceed to Stage 2

## Stage 2: Task Work

- Read the task and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, proceed to Stage 3

## Stage 3: Task Review

*If `--skip-review` was passed, skip this stage and proceed directly to Stage 4.*

- Set status to `review`
- Update the task file with final progress
- Provide the user with a completion summary
- Converse to refine — if the user requests changes, capture them in the task and execute them
- Once the user confirms, proceed to Stage 4

## Stage 4: Close

- Set status to `done`
- Set the `completed` date (ISO 8601)
- Update the increment log with a completion entry

# Output

- Completed task in `done` status
- Increment log updated
