#!/usr/bin/env node
// The shared code of the task behaviour scripts of the Projects shard: task-open, task-close, and task-defer.
// It is a module, not a command. The scripts require task-lib.js in the shard (the build strips "dev-" from each file
// name) and dev-task-lib.js in the source.
// The env of a behaviour run (NUU Orbh Task 743): FLINT_ROOT, FLINT_INVOCATION_ID, FLINT_BEHAVIOUR,
// FLINT_BEHAVIOUR_VALUE, FLINT_INVOCATION_INPUTS (a JSON object of the inputs), and ORBH_SESSION_ID.
// The task is the input "task": its title, for example "(Task) 743 Shard Invocations". The scripts find the file
// "<title>.md" under Mesh/.
// The frontmatter edits are text edits: each script changes only the lines of the fields that it owns, and keeps every
// other line and the field order.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/** A refusal or a failure. `run` prints the message on stderr and exits 1. */
class TaskError extends Error {}

/** Today in the local time zone, ISO 8601 (YYYY-MM-DD). */
function today() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The env of the run. `argv` gives the task and the value when the env has none (a run by hand). */
function readEnv(argv) {
  const root = path.resolve(process.env.FLINT_ROOT || process.cwd());
  let inputs = {};
  const rawInputs = process.env.FLINT_INVOCATION_INPUTS;
  if (rawInputs !== undefined && rawInputs.trim() !== '') {
    try {
      inputs = JSON.parse(rawInputs);
    } catch (error) {
      throw new TaskError(`FLINT_INVOCATION_INPUTS is not valid JSON: ${error.message}`);
    }
    if (inputs === null || typeof inputs !== 'object' || Array.isArray(inputs)) {
      throw new TaskError('FLINT_INVOCATION_INPUTS must be a JSON object of the inputs.');
    }
  }
  const task = typeof inputs.task === 'string' && inputs.task.trim() !== '' ? inputs.task : argv[0];
  const value = process.env.FLINT_BEHAVIOUR_VALUE !== undefined ? process.env.FLINT_BEHAVIOUR_VALUE : argv[1];
  return {
    root,
    task: task === undefined ? null : task,
    value: value === undefined ? null : value,
    invocation: process.env.FLINT_INVOCATION_ID || null,
    behaviour: process.env.FLINT_BEHAVIOUR || null,
    session: process.env.ORBH_SESSION_ID || null,
  };
}

/** The title of a task reference: a title, a wikilink, or a path to the file. */
function titleOf(ref) {
  let title = String(ref).trim();
  const link = /^\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]$/.exec(title);
  if (link) title = link[1].trim();
  title = path.basename(title);
  if (title.endsWith('.md')) title = title.slice(0, -3);
  return title;
}

const SKIP_DIRS = new Set(['node_modules']);

/** All files named `<title>.md` under the folder, in a stable order. */
function findFiles(dir, fileName, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) findFiles(full, fileName, found);
    } else if (entry.isFile() && entry.name === fileName) {
      found.push(full);
    }
  }
  return found;
}

/** The one file of a Mesh title. Refuses a missing title, no file, and more than one file. */
function findMeshFile(root, ref, what) {
  if (ref === null || String(ref).trim() === '') {
    throw new TaskError(`The invocation has no ${what} input. Set it with: flint shard invocations set-input ${what}="(Task) NNN Title"`);
  }
  const title = titleOf(ref);
  const files = findFiles(path.join(root, 'Mesh'), `${title}.md`);
  if (files.length === 0) throw new TaskError(`No file "${title}.md" under Mesh/.`);
  if (files.length > 1) {
    const list = files.map((file) => path.relative(root, file)).join(', ');
    throw new TaskError(`More than one file "${title}.md" under Mesh/: ${list}. A Mesh title must be unique.`);
  }
  return { title, file: files[0] };
}

/** The short name for the result line: "(Task) 743" for "(Task) 743 Shard Invocations", else the title. */
function shortName(title) {
  const match = /^(\(Task\) \d+)\b/.exec(title);
  return match ? match[1] : title;
}

// ---------------------------------------------------------------------------
// The document: the lines of a Markdown file with YAML frontmatter

const KEY_LINE = /^([A-Za-z0-9_][A-Za-z0-9_.-]*):(?:[ \t](.*))?$/;
const FENCE = /^\s*(```|~~~)/;

function readDoc(file) {
  const text = fs.readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  if (lines[0].replace(/^﻿/, '').trimEnd() !== '---') throw new TaskError(`${path.basename(file)} has no frontmatter: the first line is not "---".`);
  const close = lines.findIndex((line, index) => index > 0 && line.trimEnd() === '---');
  if (close < 0) throw new TaskError(`${path.basename(file)} has no end of the frontmatter: no second "---" line.`);
  return { file, eol, lines, close, changed: false };
}

function writeDoc(doc) {
  if (!doc.changed) return;
  const temp = path.join(path.dirname(doc.file), `.${path.basename(doc.file)}.${process.pid}.tmp`);
  fs.writeFileSync(temp, doc.lines.join(doc.eol));
  fs.renameSync(temp, doc.file);
}

/** The field of one key: the key line and the lines that belong to it (list items, indented lines). */
function field(doc, key) {
  for (let index = 1; index < doc.close; index += 1) {
    const match = KEY_LINE.exec(doc.lines[index]);
    if (!match || match[1] !== key) continue;
    let end = index + 1;
    while (end < doc.close && !KEY_LINE.test(doc.lines[end])) end += 1;
    // Blank lines before the next key do not belong to this field.
    while (end > index + 1 && doc.lines[end - 1].trim() === '') end -= 1;
    return { start: index, end, inline: (match[2] || '').trim() };
  }
  return null;
}

function unquote(value) {
  const text = value.trim();
  if (text.length >= 2 && ((text[0] === '"' && text.endsWith('"')) || (text[0] === "'" && text.endsWith("'")))) {
    return text.slice(1, -1);
  }
  return text.replace(/\s+#.*$/, '');
}

/** The value of a scalar field, unquoted. An empty string for a missing or empty field. */
function getScalar(doc, key) {
  const found = field(doc, key);
  return found ? unquote(found.inline) : '';
}

/**
 * Set a scalar field on its own line. A missing field goes after the first key of `after` that the file has, else at
 * the end of the frontmatter.
 */
function setScalar(doc, key, value, after = []) {
  const line = `${key}: ${value}`;
  const found = field(doc, key);
  if (found) {
    if (found.end - found.start === 1 && doc.lines[found.start] === line) return false;
    doc.lines.splice(found.start, found.end - found.start, line);
  } else {
    let at = doc.close;
    for (const anchor of after) {
      const anchorField = field(doc, anchor);
      if (anchorField) {
        at = anchorField.end;
        break;
      }
    }
    doc.lines.splice(at, 0, line);
    doc.close += 1;
  }
  doc.changed = true;
  return true;
}

/** The items of a list field: block items (`- x`) or a flow list (`[x, y]`), unquoted. */
function listItems(doc, key) {
  const found = field(doc, key);
  if (!found) return [];
  if (found.inline.startsWith('[')) {
    return found.inline.replace(/^\[|\]$/g, '').split(',').map(unquote).filter((item) => item !== '');
  }
  const items = found.inline === '' ? [] : [unquote(found.inline)];
  for (let index = found.start + 1; index < found.end; index += 1) {
    const match = /^\s*-\s+(.*)$/.exec(doc.lines[index]);
    if (match) items.push(unquote(match[1]));
  }
  return items;
}

/**
 * Add one item to a list field, as a quoted block item. Does nothing when the item is there. A missing field goes
 * before the first key of `before` that the file has, else at the end of the frontmatter.
 */
function addListItem(doc, key, item, before = []) {
  const items = listItems(doc, key);
  if (items.includes(item)) return false;
  const found = field(doc, key);
  if (!found) {
    let at = doc.close;
    for (const anchor of before) {
      const anchorField = field(doc, anchor);
      if (anchorField) {
        at = anchorField.start;
        break;
      }
    }
    doc.lines.splice(at, 0, `${key}:`, `  - ${quote(item)}`);
    doc.close += 2;
  } else if (found.inline === '') {
    // A block list: the new item goes after the last item, with the indent of the items.
    let indent = '  ';
    for (let index = found.start + 1; index < found.end; index += 1) {
      const match = /^(\s*)-\s/.exec(doc.lines[index]);
      if (match) {
        indent = match[1];
        break;
      }
    }
    doc.lines.splice(found.end, 0, `${indent}- ${quote(item)}`);
    doc.close += 1;
  } else {
    // A flow list (`[a, b]`) or one value on the key line: only this field becomes a block list.
    const rows = [`${key}:`, ...[...items, item].map((value) => `  - ${quote(value)}`)];
    doc.lines.splice(found.start, found.end - found.start, ...rows);
    doc.close += rows.length - (found.end - found.start);
  }
  doc.changed = true;
  return true;
}

function quote(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Add the session to `orbh-sessions` (the Flint session tracking rule). */
function trackSession(doc, session) {
  if (!session) return false;
  return addListItem(doc, 'orbh-sessions', `[[${session}]]`, ['template', 'authors']);
}

/** The body lines and their headings, with the lines inside code fences left out. */
function headings(doc) {
  const found = [];
  let fence = null;
  for (let index = doc.close + 1; index < doc.lines.length; index += 1) {
    const line = doc.lines[index];
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1];
      else if (fenceMatch[1] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const match = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (match) found.push({ index, level: match[1].length, text: match[2] });
  }
  return found;
}

/** The section of the first heading whose text matches: its heading line and the end (exclusive). */
function section(doc, test) {
  const all = headings(doc);
  const at = all.findIndex((heading) => test(heading.text));
  if (at < 0) return null;
  const heading = all[at];
  const next = all.slice(at + 1).find((other) => other.level <= heading.level);
  return { start: heading.index, end: next ? next.index : doc.lines.length, level: heading.level };
}

/** The index after the last line of a section that is not blank. */
function lastContentLine(doc, sect) {
  let at = sect.end;
  while (at > sect.start + 1 && doc.lines[at - 1].trim() === '') at -= 1;
  return at;
}

/** Append one line to the `# Task Log` section. A file with no such section gets one at the end. */
function appendTaskLog(doc, line) {
  const sect = section(doc, (text) => text === 'Task Log');
  if (!sect) {
    while (doc.lines.length > doc.close + 1 && doc.lines[doc.lines.length - 1].trim() === '') doc.lines.pop();
    doc.lines.push('', '# Task Log', '', line, '');
  } else {
    const at = lastContentLine(doc, sect);
    const blankAfterHeading = at === sect.start + 1;
    doc.lines.splice(at, 0, ...(blankAfterHeading ? ['', line] : [line]));
  }
  doc.changed = true;
}

/** The provenance of a log line. A run by hand has no behaviour: the line names the script. */
function provenance(env, script) {
  const by = env.behaviour ? `behaviour ${env.behaviour}` : `script ${script}`;
  return `${by}, invocation ${env.invocation || 'none'}, session ${env.session || 'none'}`;
}

/** The target of a wikilink value, for example "(Increment) 6.15 - Orbh" for "[[(Increment) 6.15 - Orbh]]". */
function linkTarget(value) {
  const match = /\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/.exec(value);
  return match ? match[1].trim() : null;
}

/**
 * Append a completion line to the Log section of an increment. The Increments template has a table
 * (`| Date | Version | Change |`); an older log is a list. Returns a phrase for the result line.
 */
function appendIncrementLog(root, increment, taskTitle, env, script) {
  const files = findFiles(path.join(root, 'Mesh'), `${increment}.md`);
  if (files.length !== 1) {
    return files.length === 0
      ? `the increment log needs a line: no file "${increment}.md" under Mesh/`
      : `the increment log needs a line: more than one file "${increment}.md" under Mesh/`;
  }
  const doc = readDoc(files[0]);
  const sect = section(doc, (text) => text === 'Log');
  if (!sect) return `the increment log needs a line: ${increment} has no Log section`;
  const link = `[[${taskTitle}]]`;
  for (let index = sect.start + 1; index < sect.end; index += 1) {
    if (doc.lines[index].includes(link) && /\bcompleted\b/.test(doc.lines[index])) {
      return `the increment log of ${increment} already has the completion line`;
    }
  }
  const change = `${link} completed (${provenance(env, script)})`;
  const at = lastContentLine(doc, sect);
  const last = doc.lines[at - 1] || '';
  if (last.trim().startsWith('|')) {
    const version = (/^\(Increment\)\s+([^\s]+)/.exec(increment) || [])[1] || '';
    doc.lines.splice(at, 0, `| ${today()} | ${version} | ${change.replace(/\|/g, '\\|')} |`);
  } else {
    const blankAfterHeading = at === sect.start + 1;
    doc.lines.splice(at, 0, ...(blankAfterHeading ? ['', `- ${today()}: ${change}`] : [`- ${today()}: ${change}`]));
  }
  doc.changed = true;
  writeDoc(doc);
  return `increment log of ${increment} updated`;
}

/** Pin the task in the session with `flint helper pins add`. Returns a phrase for the result line, or null. */
function pinTask(root, file, session) {
  if (!session) return null;
  const relative = path.relative(root, file);
  const result = spawnSync('flint', ['helper', 'pins', 'add', relative], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error || result.status !== 0) {
    const reason = result.error ? result.error.message : (result.stderr || result.stdout || `exit ${result.status}`).trim().split('\n')[0];
    process.stderr.write(`warning: flint helper pins add failed: ${reason}\n`);
    return `pin failed (${reason})`;
  }
  return 'pinned';
}

/** Run the main function of a script. A TaskError or any other error prints on stderr and exits 1. */
function run(name, main) {
  try {
    const line = main(process.argv.slice(2));
    if (line) process.stdout.write(`${line}\n`);
  } catch (error) {
    const message = error instanceof TaskError ? error.message : error && error.stack ? error.stack : String(error);
    process.stderr.write(`${name}: ${message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  TaskError,
  today,
  readEnv,
  findMeshFile,
  shortName,
  readDoc,
  writeDoc,
  getScalar,
  setScalar,
  trackSession,
  appendTaskLog,
  provenance,
  linkTarget,
  appendIncrementLog,
  pinTask,
  run,
};

if (require.main === module) {
  process.stderr.write('task-lib is the shared module of the Projects task scripts, not a command. Run: flint shard proj task-open|task-close|task-defer\n');
  process.exitCode = 2;
}
