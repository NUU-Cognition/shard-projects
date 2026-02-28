This workflow belongs to the Projects shard. Ensure you have the @init-proj.md in context before continuing.

# Workflow: Create Task

Create a task specification. 

# Input

- Context of a task

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment using `[[Hyperlink]]` syntax. All tasks must belong to an increment. To determine the increment:
  1. If user specifies an increment, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the latest `.A.0` adhoc increment (e.g., `3.A.0` if checkpoint is `3.0.0`)
- The task status should be marked as draft
- Other information like priority and due date is left blank unless specified
- Once you have completed the above, progress to the next stage. 

## Stage 2: Task Review

- Converse with the user to refine the task specifications. At this point the user might use other shards to help with communication. 
- Once you receive confirmation from the user, progress to the next stage. 

## Stage 3: Update Project

- Update the task to the relevant priority in the yaml
- Use @sk-ld-sync across everything
- Update export and state if needed

# Output

- New task specification
- New task state propagated across Flint 