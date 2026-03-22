This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Do Task

Execute an existing task through to completion. This is an **execution** workflow — the task already has a specification, and this workflow works it to done.

# Input

- Task specification (an existing Task artifact)
- (Optional) Context or aiding prompts on how to complete the task

# Actions

## Stage 1: Task Work

- Set status to `in-progress`
- Read the task fully and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision or external dependency, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, proceed to Stage 2

## Stage 2: Task Review

- Set status to `review`
- Update the task file with final progress
- Provide the user with a completion summary
- Converse to refine — if the user requests changes, capture them in the task and execute them
- Once the user confirms, proceed to Stage 3

## Stage 3: Close

- Set status to `done`
- Set the `completed` date (ISO 8601)
- Update the increment log with a completion entry

# Output

- Completed task in `done` status
- Increment log updated
