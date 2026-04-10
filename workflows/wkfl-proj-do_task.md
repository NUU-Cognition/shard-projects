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
- Once all work is complete, commit if needed (see below) and proceed to Stage 2

### Committing Repo Work

If the task has a `git-repos` field, you must commit your changes as WIP commits before moving to review. See [[knw-proj-wip_commits]] for the full convention. In short, for each repo in `git-repos`:

1. Resolve the repo path (wikilink via `flint resolve codebase`, or use the plain name/path)
2. `cd` to the repo
3. `git add` only the files you edited (never `git add -A`)
4. `git commit -m "[OR] wip: <Flint Name>/(Task) NNN Name"` (flint name without the (Flint) prefix)
5. Record the commit SHA in the task's `wip-commits` field (annotate with repo name in parens if multiple repos)
6. `cd` back to the Flint root

If there is no `git-repos` field, skip this step.

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
