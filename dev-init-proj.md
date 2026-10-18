# Projects Shard

Task management for Flint workspaces. Tasks are the fundamental unit of work.

## Two Concerns

The Projects shard serves two distinct purposes:

| Concern       | What it does                                                              | Status                                                                                    |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Execution** | Create tasks, work tasks, review completed work, capture retroactive work | Built — workflows, skills, and dashboard are operational                                  |
| **Planning**  | Prioritize, schedule, track project-level status, roadmap                 | Future — fields exist in the template but no planning-specific dashboard or workflows yet |

The **Backlog dashboard** is an execution view — it shows all tasks grouped by status, sorted by number. It does not organize by priority or due date. When the planning layer is built, it will get its own dashboard and workflows.

### Execution workflows and skills

| Tool | Type | Purpose |
|------|------|---------|
| Create and Do Task | Workflow | Create a task and immediately work it to completion |
| Do Task | Workflow | Pick up an existing task and work it to done |
| Review Task | Workflow | QA — verify completed work against requirements |
| Capture As Task | Skill | Retroactively record work already done as a completed task |
| Archive Tasks | Skill | Move completed tasks to `Mesh/Archive/Tasks/` *(stub — not yet implemented)* |

### Planning workflows and skills

| Tool | Type | Purpose |
|------|------|---------|
| Create Task | Workflow | Spec a task for later — sets it as `todo`, refines with human review |
| Scope Task | Workflow | Research-heavy task creation — investigate, propose, and persist findings in the task's Notes |
| Deprecate Task | Skill | Triage a task out of the backlog |

## Tasks and the From Field

Tasks optionally link to a parent context via the `from` frontmatter field. The parent can be an increment, a mission, or left blank. Most tasks created in quick conversation don't need a parent — don't force one.

```yaml
from: "[[(Increment) 6.10 - Shard Improvements]]"
from: "[[(Mission) 001 - Auth Rewrite]]"
from:
```

When creating a task, determine the `from` value:
1. If the user specifies a parent (increment or mission), use that
2. If the task is being created as part of a mission, link to the mission
3. If the task clearly relates to an active increment, use that
4. Otherwise, leave `from` blank

## Task Lifecycle

```
todo → in-progress → review → reviewing → reviewed → done
            ↓                      ↓
         blocked ←←←←←←←←←←←←←←←←┘

Any active status → deferred (intentional pause)
deferred → in-progress (continue directly)

Supersession (any status → terminal + superseded-by):
  → done + superseded-by         (work finished, successor extends scope)
  → superseded + superseded-by   (incomplete but valid, successor picks up)
  → deprecated + superseded-by   (stale/invalid, successor takes different path)

Any status → deprecated (terminal, dead end — no successor)
```

| Status | Meaning |
|--------|---------|
| `todo` | Ready to work on |
| `in-progress` | Actively being implemented |
| `blocked` | Waiting on human decision or external dependency |
| `deferred` | Intentionally shelved — will continue later or be superseded |
| `review` | Implementation complete, awaiting QA |
| `reviewing` | QA actively in progress |
| `reviewed` | QA passed, awaiting human acknowledgement before closing |
| `done` | Finished, ready to archive |
| `deprecated` | No longer needed — dead end with no successor |
| `superseded` | Incomplete but valid work — scope picked up by a successor |

### Supersession

Supersession is a **relationship**, not a status. The `superseded-by` field can coexist with different terminal statuses, each reflecting how far the original work got before succession:

| Scenario | Status | Has `superseded-by`? | Meaning |
|----------|--------|---------------------|---------|
| Task fully completed, successor extends scope | `done` | Yes | Work was finished; successor builds on it |
| Task partially complete or unverified | `superseded` | Yes | Valid work exists but incomplete; successor picks it up |
| Task outdated or approach was wrong | `deprecated` | Yes | Stale work; successor takes a different path |
| Task abandoned with no successor | `deprecated` | No | Dead end — no continuation |

The `supersede_task` skill accepts a target status (`done`, `superseded`, or `deprecated`) when creating the supersession link. See [[dev-sk-proj-supersede_task]] for details.

### Dynamic Relationship Fields

These fields are not part of the task template. They are added dynamically by the `supersede_task` skill when a supersession relationship is created. They can appear on tasks in any terminal status.

| Field | On | Type | Purpose |
|-------|----|------|---------|
| `superseded-by` | Old task | wikilink | Points to the successor task — can coexist with `done`, `superseded`, or `deprecated` status |
| `continues-from` | New task | wikilink | Points to the predecessor task this work continues |

Queue/active symmetry:

| Phase | Queue (waiting) | Active (working) |
|-------|----------------|-------------------|
| Implementation | `todo` | `in-progress` |
| QA | `review` | `reviewing` |

The `reviewed → done` transition is a manual human action. Agents set tasks to `reviewed` after QA passes; only a human moves them to `done`.

### Blocked transitions

A task moves to `blocked` when work cannot continue without human input or an external dependency. When the blocker is resolved, the task returns to whichever active state it came from (`in-progress` or `reviewing`). Always log the reason for blocking and the resolution in the Task Log.

```
in-progress → blocked    (log: what's blocking and why)
reviewing → blocked      (log: what's blocking and why)
blocked → in-progress    (log: blocker resolved, resuming implementation)
blocked → reviewing      (log: blocker resolved, resuming QA)
```

### Deferred transitions

A task moves to `deferred` when work is intentionally paused — not because of an external blocker, but because the team chooses to shelve it for now. Unlike `blocked`, there is no specific dependency to resolve; the task is simply not a priority right now.

When resuming a deferred task, there are two paths:

```
in-progress → deferred   (log: why the task is being shelved)
reviewing → deferred     (log: why the task is being shelved)
deferred → in-progress   (log: resuming work directly)
deferred → superseded via supersede_task skill (creates successor, links the two)
```

The typical pattern when resuming is to supersede the deferred task with a fresh successor (via the Supersede Task skill), carrying forward any unchecked requirements. Direct continuation (`deferred → in-progress`) is also supported when the original task scope is still valid.

## Repo Work and WIP Commits

When a task involves editing files in a git repository, the task's `git-repos` frontmatter field lists the repos it edits — either as wikilinks to codebase references (e.g. `[[rf-cb-flint]]`) or plain repo names.

**Branch guard:** Before making any edits to a repo, check the current branch. If you are on `dev` or `main`, you MUST branch to the machine branch first using `orbrepo open`. Never commit WIP directly to `dev`.

Before moving a task to review, agents must commit their changes in each repo as a **WIP commit**:

```
[OR] wip: <Flint Name>/(Task) NNN Name

<short paragraph describing what changed>
```

After each commit, record the SHA in the task's `wip-commits` field. If the task edits multiple repos, annotate each SHA with the repo name in parentheses (e.g. `"a1b2c3d (rf-cb-flint)"`).

Stage only the files you edited (never `git add -A`). See [[dev-knw-proj-wip_commits]] for the full convention, philosophy, staging rules, and commit sequence.

The `checkpointed` and `pr` fields on tasks are written by OrbRepo agents (checkpoint and close) — never set them yourself.

After the WIP commits, a Flint with the ITE shard follows [[sk-ite-check_after_task]].

## Checkbox Tracking

When working on tasks, agents must tick off checkbox items (`- [ ]` → `- [x]`) immediately upon completing each requirement or done criterion. This keeps the task file as the single source of truth for progress.

## Invocations

Each workflow of Projects has an invocation file (`wkfl-proj-<name>.invocation.json`, format `shard-invocation/0.3`). The files make one chain over time: a task that Scope Task or Create Task makes is ready for Do Task, and a task that Do Task leaves in `review` is ready for Review Task.

| Workflow | Start | The task | Ready (`invoke` checks the task) | Assumed state at a `done` close | Next workflow (`then`) |
|---|---|---|---|---|---|
| Scope Task | `flint shard invoke proj scope_task` | Output `task` | — | `scoped`, while `status` is `todo` | `proj do_task` |
| Create Task | `flint shard invoke proj create_task` | Output `task` | — | `specified`, while `status` is `todo` | `proj do_task` |
| Do Task | `flint shard invoke proj do_task --input task="(Task) NNN Title"` | Input `task` | `status` is not `done`, `deprecated`, `superseded`, or `reviewing` | — | `proj review_task`, in a headless session only |
| Create and Do Task | `flint shard invoke proj create_and_do_task` | Input `task`, set after Stage 1 | The same as Do Task (checked at `set-input`) | — | `proj review_task`, in a headless session only |
| Review Task | `flint shard invoke proj review_task --input task="(Task) NNN Title"` | Input `task` | `status` is `review` | — | — |

The files add these behaviours of the sequence:

| Behaviour | What happens |
|---|---|
| Readiness | `invoke` (and `set-input`) checks the task before any write: the file exists, it is a Task, and it meets the ready condition. Else the refusal `input-not-ready` gives the reason and the ways to make the task ready (`make-ready`). |
| The ways | Review Task on a task in `todo`, `in-progress`, `blocked`, or `deferred` gives `flint shard invoke proj do_task --input task=… --toward 'proj review_task'`. Review Task on a task in `reviewing` says that another review runs. Do Task on a `reviewing` task says that a review runs: wait for it to end, or ask the person. Do Task on a `done` task says: make a new task that continues it with `sk-proj-supersede_task`. |
| Assumed states | The `done` close of Scope Task records that the task is assumed `scoped`, and the `done` close of Create Task records `specified`. A state holds while the task is `todo`, until a later record replaces it or a person withdraws it. `flint shard assumed "(Task) NNN Title"` lists the states, with their source. Do Task does not need a state, but its verdict names a state that holds. |
| The next workflow | The `done` close of Scope Task and of Create Task prints the Do Task command. The `done` close of Do Task and of Create and Do Task in a headless session prints the Review Task command. An interactive session keeps the confirm of the person (`--with task-confirm`), except when the invocation was opened with `--toward 'proj review_task'`: then the agent skips the step `close`, and the `done` close prints the Review Task command. `flint shard ready "(Task) NNN Title"` lists each workflow that can take the task, with its verdict. |
| State entry | At the open, `invoke` settles each leading step that the state of the task proves done. Do Task on a task in `review` starts at the step `review`: the steps `work` and `report` are done. Do Task on a task in `reviewed` starts at the step `close`: the confirm of the person. The state never settles the step `create` of Create and Do Task: a completed `create` comes from continuation only. No step moves a `reviewing` or `reviewed` task back to `review`. |
| Continuation | A later Do Task on the same task links to the earlier invocation on that task (`continues`). When the earlier invocation is a Do Task that did not close `done`, the new one copies its settled steps and its outputs, and continues from there. `--fresh` copies nothing. When the earlier invocation is still open in a live session, `invoke` refuses (`continue-open`): close it, or use `--fresh`. |
| Modes | A step with `"modes": ["interactive"]` (the step `close` of Do Task and of Create and Do Task) is skipped at the open of a headless invocation. A step with a `next` object has one hint for each mode. |

- **When `invoke` refuses with `input-not-ready`:** do not edit the task by hand to pass the check. In an interactive session, tell the person the state of the task, the state that the workflow needs, and each way. Ask, then run the way that the person picks. `--not-ready '<why>'` opens the invocation anyway: pass it only when the person asks for it in the current message. A headless session does not choose: it returns the refusal as its blocker.
- **Close with `--outcome done`** when a workflow is finished. Only a `done` close records an assumed state and prints the next workflow. A session close or a return closes the open invocations with another outcome. A headless Do Task closes its invocation `done` before the return, and puts the Review Task command in the result.

Do Task and Create and Do Task declare these behaviours:

| Behaviour | Place | Runs | When `task.status` is | Action |
|---|---|---|---|---|
| `task-open` | `invocation.open` | Each time | `todo` | Script `task-open`: sets `in-progress`, adds the session to `orbh-sessions`, and pins the task |
| `task-hint` | `session.close`, before | Each time | `review` | Says that `--with task-confirm` moves the task to done |
| `task-return-check` | `session.return --finish`, before | Each time | `todo`, `in-progress` | Says that the task is still open, and names `--with task-defer` |
| `task-confirm` | `session.close`, `session.return`, before | Only with `--with task-confirm` (a person) | `review`, `reviewed`, `done` | Script `task-close`: sets `done` and `completed`, and writes the Task Log line and the increment log line. On a `done` task, it only adds a missing increment row |
| `task-defer` | `session.close`, `session.return`, before | Only with `--with task-defer="<reason>"` | `in-progress`, `blocked` | Script `task-defer`: sets `deferred` and writes the reason in the Task Log |

- `--with task-confirm` is the manual human action `reviewed → done`. An agent passes it only when the person asks for it in the current message.
- Each script writes one Task Log line with the behaviour, the invocation, and the session. A second run on a task that is already in the target state changes nothing.
- `--no-behaviours` on the verb runs no behaviour. The invocation record keeps this choice.
- The scripts also run by hand: `flint shard proj task-close "(Task) NNN Title"`, and `flint shard proj task-defer "(Task) NNN Title" "<reason>"`.
- With no invocation, the workflows work as before: the agent does the edits by hand.
- The record owns the steps: mark each one with `flint shard step done <step> --evidence "<…>"` or `flint shard step skip <step> --reason "<why>"`, in order. After each write, the CLI prints `now:`, `next:`, and `part of:`. Each step names its stage in the workflow, so the agent reads only that stage again after a compaction.
- The `report` step (after the work) calls the Reports shard: `flint shard invoke rpt create --input source="(Task) NNN Title"` opens the report as a child of the task. In a headless session, the report runs in the headless mode too, with the same command: its review is a self-check, with no person gate. The task has the output `report` (optional): `flint shard invocations set-output <id> report="(Report) NNN Title"`. A task with no report skips the step with a reason.
- Inside a notepad (`flint shard invoke ntpd start`), a task opens as a child of the notepad, and the session continues after the task. Then the close of the task is `flint shard proj task-close "(Task) NNN Title"` (after the person confirms) and `flint shard invocations close <id> --outcome done`, not a session close.
- One workflow file serves both modes. The mode comes from the Orbh session: a headless or subagent session runs in the headless mode, and an interactive session (or no session) runs in the interactive mode. A headless session follows the `> [!headless]` callouts of the workflow, and the invocation skips each step that is only for a person at the open (the step `close`, with `"modes": ["interactive"]`). `flint shard step` shows the step that the mode skipped. In the headless mode, the agent never passes `--with task-confirm`. It may pass `--with task-defer="<reason>"` on `flint orbh session return`.
- The scripts edit only a strict subset of the YAML frontmatter (unquoted keys at column 0; one-line values for `status`, `completed`, and `from`; a block list, an empty value, or a one-line flow list for `orbh-sessions`). They refuse every other form before any write, with the line that is not supported. Then edit the file by hand.

# Headless

A headless or subagent Orbh session has no person at the terminal. It loads this init with `flint shard start proj`, as an interactive session does. The task lifecycle, the `from` field, the WIP commits, and the checkbox tracking do not change. Each workflow has `> [!headless]` callouts in the stages that differ: follow them. Skills (`sk-proj-*`) do not change: they have no person gate.

## Interaction Model

| Interactive | Headless |
|-------------|----------|
| "Present findings to the user" | Set the interface keys, so that the Plate can show them |
| "Converse to refine" | Go on alone; ask with a deferred request only when you are stuck |
| "Once the user confirms" | Skip: there is no confirmation step |
| Status `blocked` and wait | `flint orbh request "$ORBH_SESSION_ID" "<question>"` (deferred): the session resumes with the answer. A subagent returns the blocker to its dispatcher |
| Print a completion summary | `flint orbh session return --finish "<result>"`: the result is stored on the session |

## Orbh Interface Keys

Report progress with `flint orbh session set <key> <value>`. The Plate and `flint orbh watch` read these keys. Set them each time, so that the person can follow the work without the transcript.

| Key | Type | Description | When to update |
|-----|------|-------------|----------------|
| `phase` | string | The current phase of the work | At each change of phase |
| `task` | string | The task that you work on (the file name) | One time, at the start |
| `progress` | string | A short progress indicator | After each meaningful step |

### Phase Values

**Do Task, Create and Do Task:**

| Phase | Meaning |
|-------|---------|
| `reading-task` | Reading the task and understanding it |
| `creating-task` | Writing the task spec (Create and Do Task only) |
| `implementing` | Working on the requirements |
| `blocked` | Waiting for a human answer to a deferred request |
| `deferred` | The task is shelved on purpose: the session ends cleanly |
| `complete` | All work is done: the result is returned |

**Review Task:**

| Phase | Meaning |
|-------|---------|
| `verifying` | Checking each checkbox against reality |
| `resolving` | Fixing the issues that the verification found |
| `blocked` | A verification issue needs a human decision |
| `complete` | The review is done, and the task is `reviewed` (a person moves it to `done`) |

**Create Task (fill a stub):**

| Phase | Meaning |
|-------|---------|
| `reading-stub` | Reading the stub that the Plate made |
| `writing-spec` | Writing the full task spec |
| `blocked` | The scope is not clear: a deferred request is sent |
| `complete` | The spec is written: ready for review or execution |

### Progress Format

Keep `progress` short and easy to scan:

```
"0/5 requirements"          — checkbox progress
"3/5 requirements"          — during the work
"5/5 requirements"          — all done
"verifying 2/7 checkboxes"  — during a review
"fixing 1 failed item"      — during the resolve
```

### Example Session Interface

A Do Task session, seen from the outside:

```
phase:    "reading-task"
task:     "(Task) 341 Pre-Pass Title and Description on Session Launch"
progress: "0/4 requirements"

→ phase changes to "implementing"
→ progress updates: "1/4 requirements", "2/4 requirements", ...

phase:    "complete"
progress: "4/4 requirements"
```

## Artifact Tracking

When you create or change a Mesh artifact, track it, so that the Plate can show it:

```bash
flint orbh artifact "Mesh/Types/Tasks/(Task) 341 Pre-Pass Title and Description on Session Launch.md"
```

## Result Delivery

Each headless workflow **must** end with `flint orbh session return --finish "<result>"`. The result is the main output of the session: the person and the Plate read it. Keep it short:

```bash
flint orbh session return --finish "Completed task (Task) 341. Implemented all 4 requirements: <short list>. Moved to review."
```

An exit with no return is prompted again, and then marked `failed-unreturned`. The person then has no result to read.

# Dashboards

| Dashboard | Purpose | Maintained By |
|-----------|---------|---------------|
| `(Dashboard) Backlog.md` | Execution status of all tasks | DataviewJS |

# Skills

| Skill | File | Purpose |
|-------|------|---------|
| Capture As Task | `dev-sk-proj-capture_as_task.md` | Capture recent work as a completed task |
| Deprecate Task | `dev-sk-proj-deprecate_task.md` | Mark a task as deprecated — dead end with no successor |
| Supersede Task | `dev-sk-proj-supersede_task.md` | Mark a task as superseded — redirect to a successor task |
| Archive Tasks | `dev-sk-proj-archive_tasks.md` | Archive completed tasks to `Mesh/Archive/Tasks/` *(stub)* |

# Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Create Task | `dev-wkfl-proj-create_task.md` | Spec a new task with human review (planning) |
| Scope Task | `dev-wkfl-proj-scope_task.md` | Research the problem space, then spec a task with a written proposal in Notes (planning) |
| Do Task | `dev-wkfl-proj-do_task.md` | Execute a task through to completion |
| Create and Do Task | `dev-wkfl-proj-create_and_do_task.md` | Create and immediately execute a task |
| Review Task | `dev-wkfl-proj-review_task.md` | QA review — verify completed work against requirements |
