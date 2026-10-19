#!/usr/bin/env node
// The script of the behaviour task-defer of the Projects shard (NUU Orbh Task 743). The places session.close and
// session.return run it, before the verb, when the verb gets --with task-defer="<reason>" and the task is in-progress
// or blocked.
// Invocation: flint shard proj task-defer ["(Task) NNN Title"] ["<reason>"]. The task input of the invocation and
// FLINT_BEHAVIOUR_VALUE come first; the arguments are for a run by hand.
// It moves the task from in-progress or blocked to deferred, stamps ORBH_SESSION_ID in orb: (its v1 address), and
// appends one line with the reason to the Task Log. It refuses an empty reason with exit 1.
// A task that is already deferred changes nothing. It refuses any other status, and every frontmatter form that is
// not in the subset of task-lib, with exit 1 before any write.
// Output: one result line.

const fs = require('fs');
const path = require('path');

// The shared code: task-lib.js in the shard, dev-task-lib.js in the source.
const lib = require(fs.existsSync(path.join(__dirname, 'task-lib.js')) ? './task-lib.js' : './dev-task-lib.js');

lib.run('task-defer', (argv) => {
  const env = lib.readEnv(argv);
  const reason = (env.value || '').replace(/\s+/g, ' ').trim();
  if (reason === '') {
    throw new lib.TaskError('No reason. Give the reason as the value: --with task-defer="<reason>". Nothing changed.');
  }
  const { title, file } = lib.findMeshFile(env.root, env.task, 'task');
  const name = lib.shortName(title);

  return lib.withLocks(env.root, [file], () => {
    const doc = lib.readDoc(env.root, file, 'task');
    const status = lib.getScalar(doc, 'status');
    if (status === 'deferred') return `${name} is already deferred. Nothing changed.`;
    if (status !== 'in-progress' && status !== 'blocked') {
      throw new lib.TaskError(`${name} is ${status || 'without a status'}, not in-progress or blocked. Nothing changed.`);
    }
    lib.setScalar(doc, 'status', 'deferred', ['tags']);
    lib.trackSession(doc, env.session);
    lib.appendTaskLog(doc, `- ${lib.today()}: ${status} → deferred: ${reason} (${lib.provenance(env, 'task-defer')})`);
    lib.writeDoc(doc);
    return `${name} ${status} → deferred: ${reason}`;
  });
});
