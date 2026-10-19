#!/usr/bin/env node
// The script of the behaviour task-open of the Projects shard (NUU Orbh Task 743). The place invocation.open of
// wkfl-proj-do_task and wkfl-proj-create_and_do_task runs it when the task is todo.
// Invocation: flint shard proj task-open ["(Task) NNN Title"]. The task input of the invocation comes first; the
// argument is for a run by hand.
// It moves the task from todo to in-progress, stamps ORBH_SESSION_ID in orb: (its v1 address), and appends one line
// to the Task Log. When ORBH_SESSION_ID is set, it then pins the task in the session with flint helper pins add.
// A task that is already in-progress changes nothing. It refuses any other status, and every frontmatter form that is
// not in the subset of task-lib, with exit 1 before any write.
// Output: one result line.

const fs = require('fs');
const path = require('path');

// The shared code: task-lib.js in the shard, dev-task-lib.js in the source.
const lib = require(fs.existsSync(path.join(__dirname, 'task-lib.js')) ? './task-lib.js' : './dev-task-lib.js');

lib.run('task-open', (argv) => {
  const env = lib.readEnv(argv);
  const { title, file } = lib.findMeshFile(env.root, env.task, 'task');
  const name = lib.shortName(title);

  const result = lib.withLocks(env.root, [file], () => {
    const doc = lib.readDoc(env.root, file, 'task');
    const status = lib.getScalar(doc, 'status');
    if (status === 'in-progress') return { line: `${name} is already in-progress. Nothing changed.`, changed: false };
    if (status !== 'todo') {
      throw new lib.TaskError(`${name} is ${status || 'without a status'}, not todo. Nothing changed.`);
    }
    lib.setScalar(doc, 'status', 'in-progress', ['tags']);
    const tracked = lib.trackSession(doc, env.session);
    lib.appendTaskLog(doc, `- ${lib.today()}: todo → in-progress (${lib.provenance(env, 'task-open')})`);
    lib.writeDoc(doc);
    return { line: `${name} todo → in-progress${tracked ? ', session stamped in orb' : ''}`, changed: true };
  });

  if (!result.changed) return result.line;
  const pin = lib.pinTask(env.root, file, env.session);
  return pin ? `${result.line}, ${pin}` : result.line;
});
