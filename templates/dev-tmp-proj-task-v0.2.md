# (Task) XXX [Task Name]

/* XXX is a 3-digit number. Get it with: flint helper type newnumber Task */

```markdown
---
id: [generate-uuid]
tags:
  - "#proj/task"
status: [todo|in-progress|blocked|deferred|review|reviewing|reviewed|done|deprecated|superseded]
from: [[optional parent — increment or mission wikilink, or leave blank]]
/* The from field is optional. It links to the parent context this task came from:
   - An increment: "[[(Increment) 6.10 - Shard Improvements]]"
   - A mission: "[[(Mission) 001 - Auth Rewrite]]"
   - Or left blank if the task has no parent context.
   Do not force a parent — most quick tasks don't need one. */
due: [ISO 8601]
completed: [ISO 8601]
priority: [empty|low|medium|high]
orbh-sessions:
  - "[[agent-session-uuid]]"
template: "[[dev-tmp-proj-task-v0.2]]"
authors: /* from flint whoami (the machine-global Name); omit if no Name is set */
  - "[[@Person Name]]"
artifacts-created: /* optional — list Mesh artifacts (reports, notepads, specs, etc.) created as a result of this task. Only Mesh artifacts, not code or external outputs. Populate as artifacts are created during execution. */
  - "[[artifact wikilink]]"
  - (continued)
git-repos: /* optional — list of repos this task edits. Wikilinks to codebase references (e.g. "[[rf-cb-flint]]") or plain names if no reference exists. When set, agents must commit work as WIP commits. See knw-proj-wip_commits.md. */
  - "[[rf-cb-example]]"
  - (continued)
wip-commits: /* populated by agents — append SHA after each WIP commit. If multiple repos, annotate: "a1b2c3d (rf-cb-flint)". */
checkpointed: /* do not set — written by the OrbRepo checkpoint agent with checkpoint commit SHA(s). */
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
- (continued below)

# Notes

- [any additional context, caveats, or open questions]
- (continued below)

```
