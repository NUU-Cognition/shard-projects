#!/usr/bin/env node
// The script of the behaviour task-confirm of the Projects shard (NUU Orbh Task 743). The places session.close and
// session.return run it, before the verb, when the person asks for --with task-confirm and the task is in review or
// reviewed.
// Invocation: flint shard proj task-close ["(Task) NNN Title"]. The task input of the invocation comes first; the
// argument is for a run by hand.
// It moves the task from review or reviewed to done, sets completed (today, the local date), adds ORBH_SESSION_ID to
// orbh-sessions, and appends one line to the Task Log. When from names an increment, it appends a completion line to
// the Log section of that increment; when it cannot, the result line says that the increment log needs a line.
// A task that is already done changes nothing. It refuses any other status with exit 1.
// Output: one result line.

const fs = require('fs');
const path = require('path');

// The shared code: task-lib.js in the shard, dev-task-lib.js in the source.
const lib = require(fs.existsSync(path.join(__dirname, 'task-lib.js')) ? './task-lib.js' : './dev-task-lib.js');

lib.run('task-close', (argv) => {
  const env = lib.readEnv(argv);
  const { title, file } = lib.findMeshFile(env.root, env.task, 'task');
  const name = lib.shortName(title);
  const doc = lib.readDoc(file);
  const status = lib.getScalar(doc, 'status');

  if (status === 'done') return `${name} is already done. Nothing changed.`;
  if (status !== 'review' && status !== 'reviewed') {
    throw new lib.TaskError(`${name} is ${status || 'without a status'}, not review or reviewed. Nothing changed.`);
  }

  const date = lib.today();
  lib.setScalar(doc, 'status', 'done', ['tags']);
  lib.setScalar(doc, 'completed', date, ['due', 'from', 'status']);
  lib.trackSession(doc, env.session);
  lib.appendTaskLog(doc, `- ${date}: ${status} → done, completed ${date} (${lib.provenance(env, 'task-close')})`);
  lib.writeDoc(doc);

  let line = `${name} ${status} → done, completed ${date}`;
  const increment = lib.linkTarget(lib.getScalar(doc, 'from'));
  if (increment && increment.startsWith('(Increment)')) {
    line += `; ${lib.appendIncrementLog(env.root, increment, title, env, 'task-close')}`;
  }
  return line;
});
