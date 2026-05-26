> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create Task

Spec a new task for later execution. This is a **planning** workflow — it creates a task specification and refines it with the user, but does not execute the work.

# Input

- Context of a task

# Actions

## Stage 1: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Set the `from` field if a parent context is known. The `from` field is optional — leave it blank unless a parent is clear:
  1. If user specifies a parent (increment or mission), use that
  2. If the task is part of a mission, link to the mission
  3. If the task clearly relates to an active increment, use that
  4. Otherwise, leave `from` blank
- Set status to `todo`
- **Rename the file** to match the chosen title. If the file was created as a stub with a placeholder name (e.g. `(Task) 589 New Task.md`), rename it to `(Task) 589 <Chosen Title>.md` so the filename reflects the actual task content.
- Leave priority and due date blank unless specified
- Once created, present the task to the user and proceed to Stage 2

## Stage 2: Task Review

- Converse with the user to refine the task specification — context, requirements, definition of done
- The user may use other shards to help (notepads for brainstorming, etc.)
- Once you receive confirmation from the user, proceed to Stage 3

## Stage 3: Finalise

- Set priority and due date if discussed during review
- If the task has a `from` that points to an increment, update that increment's log with an entry for the new task
- Confirm the spec is ready to work on

# Output

- New task specification in `todo` status
- Increment log updated (if `from` points to an increment)
