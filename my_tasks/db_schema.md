# Task: DB Schema (SQLite)

## Goal
Implement the first database task for the POC:
1. Create a SQLite database.
2. Save database configuration in an environment file.
3. Add 4 core tables as described in `architecture.md`.
4. Initialize the database so it is ready to use.

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

### 4) Install Dependencies and Initialize the Database
Run the following commands from inside `sources/api/`:

```bash
npm install
npm run db:init
```

- `npm install` installs `better-sqlite3`, `dotenv`, and `ts-node`.
- `npm run db:init` creates `data/exportwise.db` and applies the schema.
- The init script is idempotent — safe to re-run at any time without data loss.
- After this step the database file persists on disk and survives reboots.

## Notes
- Keep this iteration simple (POC level).
- Avoid over-engineering and unnecessary normalization in this task.
- Ensure naming stays consistent with project architecture terms.

## Definition of Done
- `npm install` completed successfully inside `sources/api/`.
- `npm run db:init` ran without errors.
- `data/exportwise.db` exists and can be opened.
- `.env` includes DB config.
- All 4 tables (`Country`, `Manufacturer`, `Product`, `CommitteeDecision`) are created and queryable.
- Schema matches the conceptual model in `architecture.md`.
