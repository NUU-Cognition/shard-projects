> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create Task

Spec a new task for later execution. This is a **planning** workflow — it creates a task specification and refines it with the user, but does not execute the work.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Do not wait for a person.
> - The Tasks Board Plate often makes a stub task and starts a headless session to fill it in. Then the task file exists already: rewrite it into a complete spec. Do not create a second task.
> - Report progress with the session key `phase`: `flint orbh session set phase <phase>`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - End the turn with `flint orbh session return --finish "<result>"`.

# Input

- Context of a task

> [!headless]
> - Or an existing stub task that the Plate made. Its `**Raw Prompt**` section under `# Context` has the original request of the person.

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

> [!headless]
> With a stub task from the Plate:
> - Read the stub fully, and read the @tmp-proj-task template for the structure. Set `flint orbh session set phase reading-stub`.
> - Use the `**Raw Prompt**` section as your source material.
> - Rewrite the stub in place into a complete spec. Choose a concrete, descriptive title, and rename the file. Write the Context (replace the raw prompt with context paragraphs, and keep `**Raw Prompt**` as a subsection for reference). Write the Requirements and the Definition of Done as checkboxes. Add Notes when they help.
> - Keep the artifact `id`, the task number, and each frontmatter field that is set already (`from`, `priority`). Keep the status `todo`.
> - Set `flint orbh session set phase writing-spec`, and track the task: `flint orbh artifact "Mesh/Types/Tasks/(Task) NNN Title.md"`.
>
> With no stub, create the task as this stage says. Do not present the task to a person: go on to Stage 2.

## Stage 2: Task Review

- Converse with the user to refine the task specification — context, requirements, definition of done
- The user may use other shards to help (notepads for brainstorming, etc.)
- Once you receive confirmation from the user, proceed to Stage 3

> [!headless]
> Do not converse with a person. Check the spec yourself: it must read as a complete, actionable task.
> When the request is not clear and you cannot find a reasonable scope:
> 1. Write the best spec that you can with what you have
> 2. Note the ambiguity in the Task Log
> 3. Set `phase blocked`, and use a deferred request: `flint orbh request "$ORBH_SESSION_ID" "<what you need to finish the spec>"`. A subagent session asks no person: it returns the question to its dispatcher.

## Stage 3: Finalise

- Set priority and due date if discussed during review
- If the task has a `from` that points to an increment, update that increment's log with an entry for the new task
- Confirm the spec is ready to work on

> [!headless]
> - Add a Task Log entry that records the creation of the spec.
> - Set `flint orbh session set phase complete`, and return: `flint orbh session return --finish "Specced task (Task) NNN <title>. Ready for review or execution."`

# Output

- New task specification in `todo` status
- Increment log updated (if `from` points to an increment)

> [!headless]
> - The Orbh result has the title of the task and a short summary
