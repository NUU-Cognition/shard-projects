# Skill: Supersede Task

Create a succession link between an old task and its successor. The `superseded-by` field is a cross-status relationship — it records that a successor exists independently of the old task's terminal status.

# Input

- Task being superseded (old task)
- Superseding task (new task — must already exist)
- Target status for the old task: `done`, `superseded`, or `deprecated`
- (Optional) Reason for superseding

# Target Status

The target status reflects **how far the original work got** before succession. Pick the one that matches:

| Target Status | When to use | Meaning |
|---------------|-------------|---------|
| `done` | Task was fully completed; successor extends its scope | Work finished, successor builds on it |
| `superseded` | Task is partially complete or unverified but still valid | Valid work exists but is incomplete; successor picks it up |
| `deprecated` | Task is outdated, invalid, or the approach was wrong | Stale work; successor takes a different path |

# Actions

- Set the old task's `status` to the chosen target status
- Add a `superseded-by` wikilink field to the old task's frontmatter, pointing to the new task
- Add a `continues-from` wikilink field to the new task's frontmatter, pointing to the old task
- Add a Task Log entry to the old task: `YYYY-MM-DD: Superseded by [[(Task) NNN Name]]. Status set to [target status]. [reason]`
- Add a Task Log entry to the new task: `YYYY-MM-DD: Continues from [[(Task) NNN Name]]. [reason]`
- Review the old task's unchecked requirements — if any are relevant to the new task, add a "Carried Requirements" note in the new task's Notes section listing what was carried forward
- Report the supersession to the user

# Notes

- The `superseded-by` field can coexist with any terminal status (`done`, `superseded`, `deprecated`). It is not tied to the `superseded` status alone.
- The `continues-from` field on the new task is informational metadata. It does not change the new task's lifecycle.
- The `superseded-by` and `continues-from` fields are dynamic — they are not part of the task template and only appear when this skill adds them.
- Tasks with `superseded-by` are visually identifiable in dashboards and the Tasks Board Plate regardless of their terminal status.
- The old task's number is preserved to maintain referential integrity.
