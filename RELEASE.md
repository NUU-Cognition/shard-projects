# Projects Releases

## Release 1.7.0

- One workflow for each mode (NUU Orbh Task 748). The headless workflows (`hwkfl-proj-*`) and the headless init (`hinit-proj`) are merged into the normal files. A stage that differs in a headless session has a `> [!headless]` callout. The init has a `# Headless` section. `flint shard start proj` loads the shard in each mode, and the mode comes from the Orbh session.
- The invocation files have the format `shard-invocation/0.3` (NUU Orbh Task 748):
  - Scope Task and Create Task have new invocation files. Their output `task` assumes the state `scoped` or `specified` while the status is `todo`. Their close names Do Task as the next workflow (`then`).
  - Review Task has a new invocation file. Its input `task` must have the status `review`. When the task is not ready, the refusal gives Do Task with `--toward 'proj review_task'` as the way to make it ready.
  - Do Task refuses a task that is done, deprecated, or superseded, and a task in `reviewing`. The state settles its steps `work` and `report` (`done-when`). Its step `close` runs only in an interactive session. A headless Do Task names Review Task as the next workflow.
  - Create and Do Task has the same modes and the `next` text of each mode.
- This version needs a Flint CLI with shard invocations 0.3 (NUU Orbh Task 748).

## Release 1.6.0

- The workflows Do Task and Create and Do Task (interactive and headless) have invocation files (NUU Orbh Task 743). `flint shard invoke proj do_task --input task="(Task) NNN Title"` starts one. The behaviours `task-open`, `task-hint`, `task-return-check`, `task-confirm`, and `task-defer` do the edits of the task status, with the scripts `task-open`, `task-close`, and `task-defer`.
- The invocation files have the format `shard-invocation/0.2` (NUU Orbh Task 744). Each step names its stage and has a `next` hint. The record owns the steps: `flint shard step done <step>` and `flint shard step skip <step> --reason "<why>"`.
- A new step and stage **Report** comes after the work. It calls the Reports shard (`flint shard invoke rpt create`), and the report opens as a child of the task. The task has the optional output `report`. The stages after the work have a new number: Do Task has 4 stages, and Create and Do Task has 5.
- A headless task calls the headless report (`flint shard invoke rpt create --headless`, Reports 0.2.0), so no step waits for a person.
- Inside a notepad, a task opens as a child of the notepad. The close of the task is then `flint shard proj task-close` and `flint shard invocations close`, not a session close.
- In a Flint with the ITE shard, the end of a product task first emits the event `task.finished` with the changed files (`sk-ite-check_after_task`), so that the agent of each program keeps its map true (NUU Flint Task 1245).
- This version needs a Flint CLI with shard invocations 0.2 (NUU Orbh Task 744).

## Release 1.5.0

- At the end of a product task, a Flint with the ITE shard follows `sk-ite-check_after_task` in place of `sk-orbc-check_after_task`. OrbCode is now a part of the ITE (NUU Flint Task 1241).

## Release 1.4.2

- The dependency on the Flint shard accepts any version (`"@nuucognition/flint": ""`), so the shard works with Flint 0.3.x and with Flint 0.4.0 (NUU Flint Task 1129).
