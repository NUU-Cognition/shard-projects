#!/usr/bin/env node
// The script of the behaviour task-confirm of the Projects shard (NUU Orbh Task 743). The places session.close and
// session.return run it, before the verb, when the person asks for --with task-confirm and the task is in review or
// reviewed.
// Invocation: flint shard proj task-close ["(Task) NNN Title"]. The task input of the invocation comes first; the
// argument is for a run by hand.
// It moves the task from review or reviewed to done, sets completed (today, the local date), stamps ORBH_SESSION_ID in
// orb: (its v1 address), and appends one line to the Task Log. When from names an increment, it appends the completion
// row to the Log section of that increment. When it cannot find one increment file or its Log section, the result line
// says that the increment log needs a line.
// Both edits are made and checked in memory before the first write, under the locks of both files (taken in the
// order of the sorted real paths). A refusal writes nothing.
// A task that is already done keeps its fields. The script still adds the completion row when it is missing (a retry
// completes the work) and says so. It refuses any other status, and every frontmatter form that is not in the subset
// of task-lib, with exit 1 before any write.
// Output: one result line.

const fs = require('fs');
const path = require('path');

// The shared code: task-lib.js in the shard, dev-task-lib.js in the source.
const lib = require(fs.existsSync(path.join(__dirname, 'task-lib.js')) ? './task-lib.js' : './dev-task-lib.js');

lib.run('task-close', (argv) => {
  const env = lib.readEnv(argv);
  const { title, file } = lib.findMeshFile(env.root, env.task, 'task');
  const name = lib.shortName(title);

  // A first read finds the increment, so that the script takes the locks of both files in one order.
  const increment = lib.incrementOf(lib.readDoc(env.root, file, 'task'));
  const found = increment ? lib.findIncrement(env.root, increment) : null;
  const files = found && found.file ? [file, found.file] : [file];

  return lib.withLocks(env.root, files, () => {
    const doc = lib.readDoc(env.root, file, 'task');
    if (lib.incrementOf(doc) !== increment) {
      throw new lib.TaskError(`The from field of ${name} changed during the run. Run again. Nothing changed.`);
    }
    const status = lib.getScalar(doc, 'status');
    if (status !== 'done' && status !== 'review' && status !== 'reviewed') {
      throw new lib.TaskError(`${name} is ${status || 'without a status'}, not review or reviewed. Nothing changed.`);
    }

    // The task edit, in memory.
    const date = lib.today();
    if (status !== 'done') {
      lib.setScalar(doc, 'status', 'done', ['tags']);
      lib.setScalar(doc, 'completed', date, ['due', 'from', 'status']);
      lib.trackSession(doc, env.session);
      lib.appendTaskLog(doc, `- ${date}: ${status} → done, completed ${date} (${lib.provenance(env, 'task-close')})`);
    }

    // The increment edit, in memory. The row of a task that is already done has the date of its completed field.
    let note = null;
    let inc = null;
    if (increment && !found.file) note = found.reason;
    if (increment && found.file) {
      inc = lib.readDoc(env.root, found.file, 'increment');
      const completed = lib.getScalar(doc, 'completed');
      const rowDate = /^\d{4}-\d{2}-\d{2}$/.test(completed) ? completed : date;
      note = lib.prepareIncrementRow(inc, increment, title, rowDate, env);
    }

    // The writes: only after both edits passed.
    lib.writeDoc(doc);
    let rowAdded = false;
    if (inc) {
      try {
        rowAdded = lib.writeDoc(inc);
      } catch (error) {
        // The task can be done now. task-confirm also runs on a done task, so a second --with task-confirm adds the row.
        const state = status === 'done' ? 'is already done' : 'is done';
        throw new lib.TaskError(`${name} ${state}, but the completion row of ${increment} is not written: ${error.message} Run --with task-confirm again to add the row.`);
      }
    }

    if (status !== 'done') return `${name} ${status} → done, completed ${date}${note ? `; ${note}` : ''}`;
    if (rowAdded) return `${name} is already done; the missing completion row is added: ${note}`;
    return `${name} is already done. Nothing changed${note ? `; ${note}` : ''}.`;
  });
});
