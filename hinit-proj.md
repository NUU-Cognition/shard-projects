# Projects Shard — Headless

You are running headless via OrbH. This file replaces `init-proj.md` for headless sessions. The task lifecycle, increment rules, and checkbox tracking are unchanged — read `init-proj.md` for those fundamentals. Tasks are created using the [[tmp-proj-task-v0.1]] template. This file teaches you what's different when there's no human at the terminal.

## Headless Workflows

Use these instead of the interactive `wkfl-*` counterparts. They remove stage gates and add OrbH interface reporting.

| Workflow | File | Replaces | When to use |
|----------|------|----------|-------------|
| Do Task | `hwkfl-proj-do_task.md` | `wkfl-proj-do_task.md` | Execute or refine an existing task |
| Review Task | `hwkfl-proj-review_task.md` | `wkfl-proj-review_task.md` | QA review of completed work |
| Create Task | `hwkfl-proj-create_task.md` | `wkfl-proj-create_task.md` | Fill in a stub created by the Plate |
| Create and Do Task | `hwkfl-proj-create_and_do_task.md` | `wkfl-proj-create_and_do_task.md` | Create and execute in one session |

Skills (`sk-proj-*`) work unchanged in headless mode — they're atomic and have no interactive checkpoints.

## OrbH Interface Schema

In headless mode, you communicate progress via `flint orb set <id> <key> <value>`. The Plate UI and `flint orb watch` read these keys. **Set them consistently** so the human can track your work without reading the transcript.

### Required Keys

| Key | Type | Description | When to update |
|-----|------|-------------|----------------|
| `phase` | string | Current phase of work | Every phase transition |
| `task` | string | The task you're working on (filename) | Once, at session start |
| `progress` | string | Human-readable progress indicator | After each meaningful step |

### Phase Values

Phases are shard-specific — these are the Projects shard phases. Set the `phase` key to one of these values as you move through the workflow.

**Do Task / Create and Do Task:**

| Phase | Meaning |
|-------|---------|
| `reading-task` | Reading and understanding the task spec |
| `creating-task` | Writing the task spec (create-and-do only) |
| `implementing` | Actively working on requirements |
| `blocked` | Waiting for human input via deferred question |
| `complete` | All work done, returning result |

**Review Task:**

| Phase | Meaning |
|-------|---------|
| `verifying` | Checking each checkbox against reality |
| `resolving` | Fixing issues found during verification |
| `blocked` | Needs human decision on a verification issue |
| `complete` | Review done, task closed |

**Create Task (stub fill):**

| Phase | Meaning |
|-------|---------|
| `reading-stub` | Reading the Plate-created stub |
| `writing-spec` | Writing the full task specification |
| `blocked` | Scope unclear, deferred question sent |
| `complete` | Spec written, ready for review or execution |

### Progress Format

Progress should be a compact, scannable string. Use these patterns:

```
"0/5 requirements"          — checkbox progress
"3/5 requirements"          — mid-execution
"5/5 requirements"          — all done
"verifying 2/7 checkboxes"  — during review
"fixing 1 failed item"      — during resolve
```

### Example Session Interface

Here's what a full Do Task session looks like from the outside:

```
phase:    "reading-task"
task:     "(Task) 341 Pre-Pass Title and Description on Session Launch"
progress: "0/4 requirements"

→ phase changes to "implementing"
→ progress updates: "1/4 requirements", "2/4 requirements", ...

phase:    "complete"
progress: "4/4 requirements"
```

## Interaction Model

**No terminal.** You have no human at the other end typing responses. The differences:

| Interactive | Headless |
|-------------|----------|
| "Present findings to the user" | Set interface keys so the Plate can display them |
| "Converse to refine" | Proceed autonomously; defer if genuinely stuck |
| "Once the user confirms" | Skip — there's no confirmation step |
| Status `blocked` + wait | `flint orb request` (deferred) — exit and resume later |
| Print completion summary | `flint orb return` — structured result stored on the session |

## Artifact Tracking

When you create or modify a Mesh artifact, register it so the Plate can display it:

```bash
flint orb artifact <id> "(Task) 341 Pre-Pass Title and Description on Session Launch"
```

## Result Delivery

Every headless workflow **must** end with `flint orb return`. The result is the primary output of your session — the human and the Plate read it. Keep it concise:

```bash
flint orb return <id> "Completed task (Task) 341. Implemented all 4 requirements: <brief list>. Moved to review."
```

If you exit without calling return, the session is marked `suspended` and the human has no structured output to read.
