This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Headless Workflow: Create Task

Autonomously spec a task via OrbH. Used when the Tasks Board Plate creates a stub artifact and launches an agent to fill it in. The task file already exists — rewrite it into a complete spec.

# Input

- An existing task artifact (stub created by the Plate)
- The stub contains a `**Raw Prompt**` section under `# Context` with the user's original request

# Actions

## 1. Setup

- Read the task artifact fully
- Read @tmp-proj-task template for structure reference
- Extract the raw prompt from the `**Raw Prompt**` section — this is your source material
- Set OrbH interface:
  ```bash
  flint orb set <id> phase "reading-stub"
  ```

## 2. Spec

- Rewrite the artifact in place to become a complete task spec:
  - Choose a concrete, descriptive title and rename the file accordingly
  - Write the Context section (replace the raw prompt with proper context paragraphs, keep `**Raw Prompt**` as a subsection for reference)
  - Write actionable Requirements as checkboxes
  - Write a Definition of Done as checkboxes
  - Add Notes if relevant
- Preserve the existing artifact ID, task number, and any frontmatter fields already set (increment, priority)
- Keep the task in `todo` status
- Update OrbH interface:
  ```bash
  flint orb set <id> phase "writing-spec"
  flint orb artifact <id> "<final task name>"
  ```

### If Scope Is Unclear

If the raw prompt is ambiguous and you cannot determine a reasonable scope:
1. Write the best spec you can with what you have
2. Note the ambiguity in the Task Log
3. Use a deferred question:
   ```bash
   flint orb request <id> "<what you need clarified to finalize the spec>"
   ```

## 3. Complete

- Verify the spec reads as a complete, actionable task
- Add a Task Log entry recording the spec creation
- Return your result:
  ```bash
  flint orb set <id> phase "complete"
  flint orb return <id> "Specced task (Task) NNN <title>. Ready for review or execution."
  ```

# Output

- Complete task spec in `todo` status, ready to be worked
- OrbH result returned with task summary
