# WIP Commits and Repo Work

## Philosophy

Flint tasks are the unit of work. Git repos are where that work lands. The two systems need a bridge — a way to connect "what was decided and planned" (the task) to "what was actually changed" (the code).

The conventional approach is that a developer makes commits as they go, with whatever message feels right, and the connection between a task and its commits exists only in someone's head (or in a Jira link pasted into a PR description). That's fragile. When agents are doing the work, it's even worse — an agent has no persistent memory of which commits it made last week.

OrbRepo solves this with a two-phase commit model:

1. **WIP commits** — small, structured commits that agents create at the end of each work session. These are raw work product, tied to a specific Flint and task by convention. They're not meant to be pretty. They're meant to be traceable.
2. **Checkpoints** — clean, squashed commits produced later by the OrbRepo checkpoint agent. Checkpoints combine multiple WIP commits into a single commit with a human-readable change summary.

The key insight: **agents should not care about git hygiene.** An agent's job is to do the work and leave a breadcrumb (`wip:` commit). OrbRepo handles the rest — squashing, summarising, attributing.

## Git Conventions

A few principles govern how agents interact with git in this system:

- **Branch guard: machine branch required.** Before making any edits to a repo, check the current branch. If you are on `dev` or `main`, you MUST branch to the machine branch first using `orbrepo open` (or `git checkout -b <machine-name>` if the branch doesn't exist). Never commit WIP directly to `dev` — all work happens on machine branches.
- **One concern per commit.** A WIP commit captures the work from one task in one session. If you worked on two tasks, that's two commits.
- **Explicit staging only.** Never `git add -A` or `git add .`. Stage the specific files you touched. If the working directory has other people's uncommitted changes, those are not yours to commit.
- **No history rewriting.** Agents never rebase, amend, or force-push. The WIP commits are append-only. Only the checkpoint agent squashes, and only on safe branches.
- **The task is the record.** The task frontmatter tracks which repos were edited and which commit hashes were produced. This is the authoritative link between planning and execution.
- **Use `[OR]` prefix.** All OrbRepo-managed commits carry the `[OR]` prefix. WIP commits use `[OR] wip: Flint/(Task) NNN Name`.

## When This Applies

This applies whenever a task has a `git-repos` field in its frontmatter. That field lists the repositories this task edits — either as wikilinks to codebase references (e.g. `[[rf-cb-flint]]`) or as plain repo names if no codebase reference exists.

If a task has no `git-repos` field, there is nothing to commit — skip all of this.

## Commit Format

```
[OR] wip: <Flint Name>/<Artifact Reference>
```

Where:
- `[OR]` is the OrbRepo commit tag — all OrbRepo-managed commits carry this prefix
- `wip:` is the commit type (lowercase, followed by a space)
- `<Flint Name>` is the name of the Flint workspace the task belongs to (e.g. `NUU Flint`)
- `<Artifact Reference>` is the full artifact reference: type, number, and name (e.g. `(Task) 205 Implement auth`)

The Flint name comes from the workspace you're operating in. The artifact reference comes from the task filename.

**Examples:**

```
[OR] wip: NUU Flint/(Task) 205 Implement auth
[OR] wip: NUU OrbCraft/(Task) 031 Update renderer
[OR] wip: NUU Flint/(Task) 206 Fix middleware validation
```

## Commit Sequence

At the end of your work (before moving to review), for each repo listed in `git-repos`:

1. Resolve the repo path — if it's a wikilink like `[[rf-cb-flint]]`, use `flint resolve codebase "<Name>"`. If it's a plain name/path, use that directly.
2. `cd` to the repo
3. **Check the branch.** If on `dev` or `main`, branch to the machine branch first: `orbrepo open` or `git checkout -b <machine-name>` (get machine name from `~/.nuucognition/orbrepo/config.toml`)
4. Stage **only** the files you edited: `git add src/foo.ts src/bar.ts`
5. Commit with the WIP format: `git commit -m "[OR] wip: <Flint Name>/(Task) NNN Name"`
6. Record the commit hash (from `git rev-parse HEAD`) in the task's `wip-commits` field
7. `cd` back to the Flint root

```bash
cd /path/to/repo
# Check branch — must be on machine branch, not dev
git branch --show-current  # if "dev", run: orbrepo open
git add src/auth.ts src/middleware.ts
git commit -m "[OR] wip: NUU Flint/(Task) 205 Implement auth"
# note the SHA from the output, or: git rev-parse --short HEAD
cd /path/to/flint
```

Then update the task frontmatter — append the new SHA to `wip-commits`. If the task edits multiple repos, annotate each SHA with the repo name in parentheses:

```yaml
# single repo — no annotation needed
wip-commits:
  - "a1b2c3d"

# multiple repos — annotate with repo name
wip-commits:
  - "a1b2c3d (rf-cb-flint)"
  - "e5f6g7h (rf-cb-monorepo)"
```

## Staging Rules

- **Only stage files you edited** during this task. Never `git add -A` or `git add .`
- If the working directory already has uncommitted changes to files you did not edit, leave them alone — commit only your files
- Multiple WIP commits per task are allowed if the changes are large or logically distinct. Use the same message format each time. Record each SHA.

## Task Frontmatter Fields

| Field | Type | Who sets it | Purpose |
|-------|------|------------|---------|
| `git-repos` | list | Agent or human at task creation | Repos this task edits — wikilinks (e.g. `"[[rf-cb-flint]]"`) or plain names if no codebase reference exists |
| `wip-commits` | list | Agent after each WIP commit | SHA hashes of WIP commits. If task edits multiple repos, annotate each with the repo name in parens (e.g. `"a1b2c3d (rf-cb-flint)"`) |
| `checkpointed` | list | Checkpoint agent only | SHA(s) of checkpoint commits that squashed this task's WIP commits. If multiple repos, annotated the same way as `wip-commits` |

**Never write the `checkpointed` field yourself.** That is the checkpoint agent's job during `orbrepo checkpoint`.

**Examples:**

```yaml
# Task editing one repo
git-repos:
  - "[[rf-cb-flint]]"
wip-commits:
  - "a1b2c3d"
  - "f8e9d0c"
checkpointed:

# Task editing multiple repos
git-repos:
  - "[[rf-cb-flint]]"
  - "main-monorepo"
wip-commits:
  - "a1b2c3d (rf-cb-flint)"
  - "e5f6g7h (main-monorepo)"
  - "k9l0m1n (rf-cb-flint)"
checkpointed:

# Task with no code changes
# (no git-repos field at all)
```

## Resolving Repo Paths

If a `git-repos` entry is a wikilink like `[[rf-cb-flint]]`, resolve it to a local path:

```bash
flint resolve codebase "Flint"
```

The name to pass is the codebase name from the reference file (e.g. "Flint", "Monorepo"), not the filename.

If a `git-repos` entry is a plain string (no wikilink), it is either a name you can try to resolve or a direct path. Use your judgment.
