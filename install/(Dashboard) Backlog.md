---
id: {{uuid}}
tags:
  - "#dashboard"
  - "#proj/backlog"
  - "#managed/shard/proj"
  - "#read-only"
---

```dataviewjs
function formatName(p) {
  return p.file.name.replace(/^\(Task\)\s*/, '');
}

function statusIcon(status) {
  const icons = {
    'todo': '⚪',
    'in-progress': '🔵',
    'blocked': '🟠',
    'review': '🔍',
    'reviewing': '🔎',
    'done': '✅',
    'deprecated': '🚫'
  };
  return icons[status] || '⚪';
}

function taskNumber(p) {
  const match = p.file.name.match(/^\(Task\)\s*(\d+)/);
  return match ? parseInt(match[1]) : 9999;
}

function formatDate(d) {
  if (!d) return "—";
  return String(d).split('T')[0];
}

const tasks = dv.pages('#proj/task').where(p => p.file.path.startsWith('Mesh/Types/Tasks/'));

const activeStatuses = ['in-progress', 'reviewing', 'review', 'blocked', 'todo'];

for (const status of activeStatuses) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  dv.header(1, statusIcon(status) + ' ' + label);
  const group = tasks.where(p => p.status === status)
    .array().sort((a, b) => taskNumber(a) - taskNumber(b));
  if (group.length === 0) {
    dv.paragraph("*None*");
  } else {
    dv.table(["#", "Task", "Increment"],
      group.map(p => [
        taskNumber(p),
        dv.fileLink(p.file.path, false, formatName(p)),
        p.increment ?? "—"
      ])
    );
  }
}

// Recently Completed
dv.header(1, "✅ Recently Completed");
const completed = tasks.where(p => p.status === 'done')
  .array().sort((a, b) => {
    const dateA = a.completed ? new Date(a.completed) : new Date(0);
    const dateB = b.completed ? new Date(b.completed) : new Date(0);
    return dateB - dateA;
  }).slice(0, 10);
if (completed.length === 0) {
  dv.paragraph("*None*");
} else {
  dv.table(["#", "Task", "Completed"],
    completed.map(p => [
      taskNumber(p),
      dv.fileLink(p.file.path, false, formatName(p)),
      formatDate(p.completed)
    ])
  );
}
```
