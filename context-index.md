# Context Index (Load Order)

Use this file as the single entry point for project context loading.

## Required Load Order
1. `CLAUDE.md` (global rules and behavior)
2. `context.md` (runtime project snapshot)
3. Domain-specific context from `sub-context/` based on task type
4. Deep reference documents only when needed

## Domain-Specific Routing
- API tasks -> `sub-context/api-context.md`
- SQL/data-model/seed tasks -> `sub-context/data-context.md`
- Vector/indexing/retrieval tasks -> `sub-context/vector-context.md`
- Angular/client/UI tasks -> `sub-context/client-context.md`

## Deep References (Load On Demand)
- `architecture.md`
- `PROJECT.md`

## Working Rules
- Do not load all deep documents by default.
- Load only the minimum context required for the current task.
- Treat SQL as source of truth, Vector as retrieval/index layer, and LLM as advisory reasoning layer.
