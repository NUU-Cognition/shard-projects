---
description: "Research-heavy task scoping — investigate the problem, draft a proposal, and persist findings in the task's Notes section"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

This workflow belongs to the Projects shard. Ensure you have @init-proj.md in context before continuing.

# Workflow: Scope Task

Research a problem space, then spec a task with a written proposal. This is a **planning** workflow — like [[dev-wkfl-proj-create_task]], but front-loaded with investigation. The output is a `todo` task whose Notes section carries paragraphs of research findings and a proposed approach the user can review before any work begins.

Use this when the request is fuzzy, the approach is non-obvious, or the user wants a reasoned proposal before committing to scope.

# Input

- A problem, opportunity, or fuzzy request to scope
- (Optional) Pointers to related artifacts, code, or prior conversations

# Actions

## Stage 1: Research

Investigate before writing anything. Cast a wide net — this stage is where the value of `scope_task` over `create_task` lives.

- Search the Mesh for related artifacts (existing tasks, notepads, plans, reports, concepts)
- Read any referenced codebases or files the request touches
- Walk wikilinks from any anchor artifact the user mentioned
- Note prior decisions, superseded approaches, or open questions you encounter
- Collect raw findings — quotes, file paths, links — into your working memory; do not write them into the Mesh yet

If the research surfaces a blocking ambiguity (the request could mean two very different things), pause and ask the user before proceeding. Otherwise, continue.

Once you have a coherent picture of the problem space, proceed to Stage 2.

## Stage 2: Draft Proposal

Synthesise your findings into a written proposal. This is the centrepiece of the workflow.

The proposal lives in the task's **Notes** section as paragraphs (not bullets). Structure it loosely as:

- **Background** — what you found in the Mesh, the codebase, and prior work; how the request fits into existing context
- **Proposed Approach** — your recommended path forward, in prose, with the reasoning visible
- **Alternatives Considered** — other paths and why you didn't pick them
- **Open Questions** — anything still unresolved that the user should weigh in on
- **References** — wikilinks and file paths the user can walk to verify your reasoning

Write in paragraphs, not lists. The Notes section in a scoped task reads like a short memo, not a checklist. Bullets belong in Requirements and Definition of Done — the Notes section carries the *thinking*.

## Stage 3: Task Creation

- Create the task using the @tmp-proj-task template. Get the next task number with `flint helper type newnumber Task`.
- Title the task after the **proposed approach**, not the original fuzzy request — the title should reflect what the task will actually do.
- Set the `from` field if a parent context is known (same rules as [[dev-wkfl-proj-create_task]]). If your research uncovered a clear parent (an increment, mission, or sibling task), use it.
- Set status to `todo`
- Fill out **Context**, **Task Description**, **Task Requirements**, and **Definition of Done** based on the proposed approach — these should be concrete now that the research is done
- Append the **proposal from Stage 2 as paragraphs at the bottom of the Notes section**. Keep the existing Notes bullet structure intact above it; the proposal goes below as prose.
- **Rename the file** to match the chosen title (`flint helper rename ...`)
- List any Mesh artifacts you read or referenced under `artifacts-created` only if you actually produced them; do not list pre-existing artifacts there (use wikilinks in the proposal instead)
- Leave priority and due date blank unless specified

Once created, present the task — and especially the proposal — to the user and proceed to Stage 4.

## Stage 4: Proposal Review

- Walk the user through the proposal: what you found, what you recommend, what alternatives you weighed, what's still open
- Converse to refine — the user may push back on the approach, change scope, or answer your open questions
- Update the task in place as the conversation evolves: tighten Requirements, adjust Definition of Done, edit the proposal paragraphs to reflect new direction
- The user may invoke other shards to help (notepads for deeper brainstorming, plans for larger scope) — link any artifacts produced
- Once the user confirms the scoped task reflects the agreed direction, proceed to Stage 5

## Stage 5: Finalise

- Set priority and due date if discussed during review
- Resolve or explicitly defer every Open Question in the proposal — no open questions should be left dangling at handoff time
- If the task has a `from` that points to an increment, update that increment's log with an entry for the new task and a one-line summary of the proposal
- Confirm the spec is ready to be picked up by [[dev-wkfl-proj-do_task]] or [[dev-wkfl-proj-create_and_do_task]] (the latter doesn't apply here — the task already exists)

# Output

- New task specification in `todo` status
- Notes section contains a written proposal in paragraphs (background, approach, alternatives, open questions, references)
- Increment log updated (if `from` points to an increment)
