# (Task) XXX [Task Name]

/* XXX is a 3-digit number. Get it with: flint helper type newnumber Task */

```markdown
---
id: [generate-uuid]
tags:
  - "#proj/task"
status: [todo|in-progress|review|reviewing|done|deprecated]
increment: [[parent increment hyperlink to file]]
/* All tasks must belong to an increment. See init-proj.md for how to determine the increment. */
due: [ISO 8601]
completed: [ISO 8601]
priority: [empty|low|medium|high]
[agent]-sessions: /* replace [agent] with your agent type (claude, codex, etc.) */
template: "[[tmp-proj-task-v0.1]]"
authors: /* from .flint/identity.json; omit if no identity set */
  - "[[@Person Name]]"
---

# Context

[paragraph(s) description of the context of this task — what motivated it, what problem it solves, or what opportunity it addresses]

**Related Documents**

- [[related document(s)]]
- (continued)

# Task Description

[concise summary of what needs to be done — 1-3 sentences that someone could read to understand the task at a glance]

# Task Requirements

[paragraph(s) description of the task requirements (high level)]

- [ ] [specific requirement (low level, actionable checkbox)]
- (continued)

/*
  CHECKBOX RULES:
  - Each checkbox should be a concrete, verifiable action
  - Write checkboxes so that "done" is unambiguous
  - Agents must tick checkboxes immediately upon completion (- [ ] → - [x])
*/

# Definition of Done

[paragraph(s) description of the definition of done (high level) — what does "finished" look like?]

- [ ] [specific done criteria (verifiable checkpoint)]
- (continued)

# Task Log

/*
  Log entries are chronological. Each entry records meaningful progress, decisions, or blockers.
  Format: YYYY-MM-DD: description of what happened
  Agents should update this whenever they complete checkboxes or make significant progress.
*/

- YYYY-MM-DD: [agent or human reports implementation progress]
- (continued)

# Notes

- [any additional context, caveats, or open questions]
- (continued)

```
