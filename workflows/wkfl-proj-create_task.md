This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create Task

Spec a new task for later execution. This is a **planning** workflow — it creates a task specification and refines it with the user, but does not execute the work.

# Input

- Context of a task

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `increment` field to link to the parent increment using `[[Hyperlink]]` syntax. All tasks must belong to an increment. To determine the increment:
  1. If user specifies an increment, use that
  2. If the task clearly relates to an active increment (check increment titles), use that
  3. Otherwise, default to the current adhoc increment (e.g., `6.A`)
- Set status to `todo`
- Leave priority and due date blank unless specified
- Once created, present the task to the user and proceed to Stage 2

## Stage 2: Task Review

- Converse with the user to refine the task specification — context, requirements, definition of done
- The user may use other shards to help (notepads for brainstorming, etc.)
- Once you receive confirmation from the user, proceed to Stage 3

## Stage 3: Finalise

- Set priority and due date if discussed during review
- Update the increment log with an entry for the new task
- Confirm the spec is ready to work on

# Output

- New task specification in `todo` status
- Increment log updated
