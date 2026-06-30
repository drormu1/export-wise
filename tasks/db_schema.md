# Task: DB Schema (SQLite)

## Goal
Implement the first database task for the POC:
1. Create a SQLite database.
2. Save database configuration in an environment file.
3. Add 4 core tables as described in `architecture.md`.

## Source of Truth
Use the conceptual model in `architecture.md`:
- `Country`
- `Manufacturer`
- `Product`
- `CommitteeDecision`

## Scope

### 1) Create SQLite DB
- Create a local SQLite database file for the project.
- Keep the data layer compatible with future SQL Server migration.

### 2) Save Config in `.env`
- Add database connection configuration to `.env`.
- Do not hardcode the database path in source code.

### 3) Add 4 Core Tables
Create these tables based on the architecture model:

#### `Country`
- `id`
- `name`
- `region`

#### `Manufacturer`
- `id`
- `name`

#### `Product`
- `id`
- `name`
- `category`
- `ingredients`
- `description`

#### `CommitteeDecision`
- `id`
- `country`
- `product`
- `manufacturer`
- `decisionStatus`
- `decisionReason`
- `conditions`
- `risks`
- `decisionDate`

## Notes
- Keep this iteration simple (POC level).
- Avoid over-engineering and unnecessary normalization in this task.
- Ensure naming stays consistent with project architecture terms.

## Definition of Done
- SQLite DB exists and can be opened.
- `.env` includes DB config.
- All 4 tables are created and queryable.
- Schema matches the conceptual model in `architecture.md`.
