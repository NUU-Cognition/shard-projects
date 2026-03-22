---
id: 47cb05ed-ad06-4b7d-8a56-00e10302b613
tags:
  - "#f/metadata"
  - "#f/type"
---

# Task

A unit of work with a defined scope and completion criteria. Tasks are the fundamental building block of project execution — they capture what needs to be done, track progress through a lifecycle, and record implementation details.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#proj/task` |
| Location | `Mesh/Types/Tasks/` |
| Archive | `Mesh/Archive/Tasks/` |
| Naming | `(Task) NNN [Name].md` |
| Numbering | `flint helper type newnumber Task` |

## Lifecycle

```
todo → in-progress → review → reviewing → done
            ↓                      ↓
         blocked ←←←←←←←←←←←←←←←←┘

Any status → deprecated (terminal)
```

## Templates

- [[tmp-proj-task-v0.1]] — Standard task
