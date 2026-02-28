This workflow belongs to the Projects shard. Ensure you have the @init-proj.md in context before continuing.

# Workflow: Create and Do Task

Create a task specification and immediately execute it in a single workflow.

# Input

- Context of a task
- (Optional) aiding prompts and instructions on how to complete the task

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment using `[[Hyperlink]]` syntax. All tasks must belong to an increment. To determine the increment:
  1. If user specifies an increment, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the latest `.A.0` adhoc increment (e.g., `3.A.0` if checkpoint is `3.0.0`)
- Set the task status to `in-progress` (since we're immediately executing)
- Other information like priority and due date is left blank unless specified
- Once you have completed the above, progress to the next stage.

## Stage 2: Task Work

- Read the task and implement the task until it is finished or until you have done everything you can without human input (what is left is human blocking todos)
- Continue this loop until you think you have finished the task, at which point move to the next stage
- Whenever you complete any meaningful amount of work, make sure to record it in the task log

## Stage 3: Task Review

- Mark the task status to `review`
- Update the task file with progress
- Provide an update to the user based on your completion
- The user will converse with you to refine. If the user makes a new request or refinement, make sure to capture it in the task
- Once you receive confirmation from the user, progress to the next stage.

## Stage 4: Update Project

- Update the task to done in the yaml
- Set the completed date (ISO 8601)
- Update export and state if needed

# Output

- Completed task
- New task state propagated across Flint
