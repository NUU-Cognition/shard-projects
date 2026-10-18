> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Create Task

Spec a new task for later execution. This is a **planning** workflow — it creates a task specification and refines it with the user, but does not execute the work.

> [!headless]
> In a headless or subagent Orbh session, no person is at the terminal. Do each stage, and follow the `> [!headless]` callout in it. Do not wait for a person.
> - The Tasks Board Plate often makes a stub task and starts a headless session to fill it in. Then the task file exists already: rewrite it into a complete spec. Do not create a second task.
> - Report progress with the session key `phase`: `flint orbh session set phase <phase>`. The phase values are in the section `# Headless` of [[dev-init-proj]].
> - End the turn with `flint orbh session return --finish "<result>"`.

# Invocation

You can run this workflow as a shard invocation. The invocation is a durable record of the spec: its steps and the task that it made. The stages below do not change.

- Start the workflow with `flint shard invoke proj create_task`. The task is the output of the workflow, also when it is a stub that exists already.
- The mode comes from the Orbh session. A headless or subagent session runs in the headless mode and follows the `> [!headless]` callouts. Each step has a hint for each mode. `flint shard step` shows the current step and each step that the mode skipped.
- Mark each step when it is done: `flint shard step done <step> --evidence "<…>"`. The steps are `create`, `review`, and `finalise`. Outside an Orbh session (no `ORBH_SESSION_ID`), give `--invocation <id>` to `flint shard step`. The hint after each write prints the id.
- After Stage 1, set the output: `flint shard invocations set-output <id> task="(Task) NNN Title"`. Use the title after the rename. After a later rename, set the output again: a second set replaces the value.
- After Stage 3, close the invocation: `flint shard invocations close <id> --outcome done`. The `done` close records that the task is assumed `specified`. The state holds while the task is `todo`. Then the close prints the next command: `flint shard invoke proj do_task --input task='(Task) NNN Title'`.
- A session close or a return closes the invocation with another outcome, and records no assumed state. So close the invocation with `--outcome done` when the spec is finished.
- When no invocation is open, follow the stages with no record.

> [!headless]
> - With a stub from the Plate, set the output to the stub after its rename.
> - Close the invocation with `--outcome done` before the return, and put the `do_task` command of the close in the result.

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
- With an open invocation, close it with `--outcome done`. The close prints the `do_task` command for the task.

> [!headless]
> - Add a Task Log entry that records the creation of the spec.
> - With an open invocation, close it with `--outcome done` first: `flint shard invocations close --outcome done`.
> - Set `flint orbh session set phase complete`, and return: `flint orbh session return --finish "Specced task (Task) NNN <title>. Ready for review or execution. Next: <the do_task command>."`

# Output

- New task specification in `todo` status
- Increment log updated (if `from` points to an increment)

> [!headless]
> - The Orbh result has the title of the task and a short summary
