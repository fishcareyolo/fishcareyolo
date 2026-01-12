This repo is driven by the spec docs in `spec/`. When asked to do any task from `spec/tasks.md` (e.g. “do task 1.1”), follow this workflow every time.

## Workflow

1. **Identify the requested task**
   - Locate the exact task entry in `spec/tasks.md` (e.g. `1.1`, `2.4`, etc.).
   - Treat the task text and its referenced requirement/design notes as the source of truth for scope.

2. **Read the spec in the required order (always)**
   - Read `spec/requirements.md` to understand the functional goals + acceptance criteria relevant to the task.
   - Read `spec/design.md` to understand the intended architecture, types, services, testing strategy, and any constraints relevant to the task.
   - Re-read the specific section(s) of `spec/tasks.md` for the requested item to confirm dependencies/ordering.

3. **Confirm scope and dependencies before editing**
   - Check whether the task depends on earlier tasks (same section/numbering).
   - If prerequisites aren’t done, either implement them first (if clearly required) or ask the user whether to proceed out of order.

4. **Implement exactly what the task asks (no half measures)**
   - Make the minimum code changes needed to satisfy the task end-to-end.
   - Do not leave placeholder work behind (no `TODO:` comments, stubs, or "WIP" hacks).
   - If something blocks completion, stop and ask the user for a decision instead of shipping partials.
   - Keep changes consistent with existing project structure and patterns.
   - Do not “expand scope” beyond what the task and its referenced spec sections require.

5. **Add/Update tests when the task calls for it**
   - If the task includes a property test or unit test step, implement it as part of completing the task.
   - Prefer the test organization and conventions described in `spec/design.md`.

6. **Validate and report**
   - Run the most relevant tests/build checks for the changed area.
   - Report what was changed, where, and how it maps back to the requested task ID.

## How to interpret user requests

- If the user says: “do task `X.Y`”, use `spec/tasks.md` as the execution plan, and use `spec/requirements.md` + `spec/design.md` as constraints and acceptance criteria.
- If the user request conflicts with the spec docs, pause and ask for clarification before proceeding.
