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
- **Rename the file** to match the chosen title. If the file was created as a stub with a placeholder name (e.g. `(Task) 589 New Task.md`), rename it to `(Task) 589 <Chosen Title>.md` so the filename reflects the actual task content.
- Leave priority and due date blank unless specified
- Once created, proceed to Stage 2

## Stage 2: Task Work

- Read the task and implement until finished, or until you've done everything possible without human input
- Whenever you complete a requirement or definition-of-done checkbox, tick it immediately (`- [ ]` → `- [x]`)
- Whenever you complete meaningful work, record it in the Task Log
- If blocked on a human decision, set status to `blocked`, log the reason, and present the blocker to the user. When resolved, return to `in-progress` and continue.
- Once all work is complete, commit if needed (see below) and proceed to Stage 3

### Committing Repo Work

If the task has a `git-repos` field, you must commit your changes as WIP commits before moving to review. See [[knw-proj-wip_commits]] for the full convention. In short, for each repo in `git-repos`:

1. Resolve the repo path (wikilink via `flint resolve codebase`, or use the plain name/path)
2. `cd` to the repo
3. `git add` only the files you edited (never `git add -A`)
4. `git commit -m "[OR] wip: <Flint Name>/(Task) NNN Name"` (flint name without the (Flint) prefix)
5. Record the commit SHA in the task's `wip-commits` field (annotate with repo name in parens if multiple repos)
6. `cd` back to the Flint root

If there is no `git-repos` field, skip this step.

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
