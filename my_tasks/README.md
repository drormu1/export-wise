# Tasks Workflow

Use this folder to define task files once, then run each task with a short prompt.

## 1) Create a task file
- Copy `tasks/_template.md`
- Save as `tasks/<task-name>.md`
- Fill only the relevant sections

## 2) Run task with a short prompt
Use this prompt in chat:

```text
Execute task file `tasks/<task-name>.md` end-to-end.
Follow project rules from `CLAUDE.md` and `context.md`.
Show plan, implement, run checks, and summarize.
```

## 3) Keep it simple
- Do not rewrite global rules per task
- Put stable rules in `CLAUDE.md` and `context.md`
- Put only task-specific details in `tasks/<task-name>.md`

## 4) Naming convention
- Use snake_case: `tasks/db_schema.md`, `tasks/seed_data.md`, `tasks/api_search.md`
