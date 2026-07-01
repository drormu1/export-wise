# Task: NestJS API Setup + Seed Data

## Goal
Set up a minimal NestJS backend and populate all 4 core tables with realistic mock data.

At the end of this task:
- NestJS is running on `http://localhost:3000`
- `GET /health` returns `{ status: "ok" }`
- All 4 tables contain realistic mock data in Hebrew
- Data is visible in DB Browser for SQLite

## Source of Truth
- `architecture.md` — data model and tech stack
- `sub-context/data-context.md` — seed volume targets
- `sub-context/api-context.md` — endpoint contracts

## Scope

### 1) Create Mock JSON Files (Hebrew)
Before writing any code, create 4 JSON files under `sources/api/mock-jsons/`:

```
sources/api/mock-jsons/
  countries.json
  manufacturers.json
  products.json
  decisions.json
```

**Language rule:** All text fields (names, regions, categories, ingredients,
descriptions, reasons, conditions, risks) must be written in Hebrew.
Status values are also in Hebrew; dates remain ISO format.

#### `countries.json`
Array of 50 objects:
```json
[
  { "name": "גרמניה", "region": "אירופה" },
  { "name": "צרפת", "region": "אירופה" },
  ...
]
```
Regions (in Hebrew): אירופה, אסיה, אמריקה, המזרח התיכון, אפריקה, אוקיאניה

#### `manufacturers.json`
Array of 50 objects:
```json
[
  { "name": "תנובה בע\"מ" },
  { "name": "אסם השקעות" },
  ...
]
```
Mix of dairy, meat, bakery, fish, snacks, and beverage manufacturers.

#### `products.json`
Array of 50 objects:
```json
[
  {
    "name": "גבינה צהובה",
    "category": "מוצרי חלב",
    "ingredients": "חלב פסטורי, מלח, תרביות חיידקים",
    "description": "גבינה צהובה קשה מיוצרת מחלב פרות מלא"
  },
  ...
]
```
Categories (in Hebrew): מוצרי חלב, בשר ועוף, מוצרי אפייה, דגים ופירות ים, חטיפים, משקאות, ממתקים

#### `decisions.json`
Array of 200 objects:
```json
[
  {
    "countryId": 0,
    "productId": 0,
    "manufacturerId": 0,
    "decisionStatus": "אושר",
    "decisionReason": "המוצר עומד בכל דרישות התקן האירופי לגבינות",
    "conditions": null,
    "risks": "יש לוודא עמידה בגבולות חומרי השימור",
    "decisionDate": "2023-04-15"
  },
  ...
]
```
- `decisionStatus` values (Hebrew): `אושר`, `נדחה`, `אושר בתנאים`
- Distribution: ~50% אושר, ~25% נדחה, ~25% אושר בתנאים
- `conditions` is null for אושר, required for "אושר בתנאים"
- All reason/conditions/risks text in Hebrew
- Decision dates spread across 2020-2024
- Use `countryId`, `productId`, `manufacturerId` to reference the other JSON arrays
  (the seed script will resolve these to real DB IDs after insert)

### 2) NestJS Project Initialization
- Replace the current minimal `sources/api/package.json` with a full NestJS project.
- Keep the existing `db:init` and `db:seed` scripts working.
- Use `better-sqlite3` for the database (synchronous, works well with NestJS).
- TypeScript strict mode.

Install:
```bash
cd sources/api
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
npm install better-sqlite3
npm install --save-dev @nestjs/cli @types/better-sqlite3
```

### 3) App Structure
Create the following module layout inside `sources/api/src/`:

```
src/
  app.module.ts
  main.ts
  database/
    database.module.ts
    database.service.ts       <- wraps better-sqlite3, provider-agnostic interface
  health/
    health.controller.ts      <- GET /health
    health.module.ts
  seed/
    seed.service.ts           <- reads mock-jsons and populates all 4 tables
    seed.module.ts
    seed.runner.ts            <- standalone script entry point
```

### 4) DatabaseService
- Wraps `better-sqlite3` with a clean interface.
- Reads `DB_PATH` from `.env`.
- Provides `query<T>(sql, params)` and `run(sql, params)` methods.
- Enforces foreign keys and WAL mode on connection open.
- Must be injectable across all modules.

### 5) Health Endpoint
`GET /health`

Response:
```json
{ "status": "ok", "db": "connected", "timestamp": "2025-01-01T00:00:00Z" }
```

The health check should verify the DB connection is live (run a simple `SELECT 1`).

### 6) Seed Script
Add to `package.json`:
```json
"db:seed": "ts-node src/seed/seed.runner.ts"
```

The seed runner:
- Reads the 4 JSON files from `mock-jsons/`.
- Connects to the existing SQLite DB (path from `.env`).
- Clears existing data in correct FK order: CommitteeDecision first, then Product/Manufacturer/Country.
- Inserts countries, manufacturers, products (capturing generated IDs).
- Inserts decisions using resolved IDs from previous inserts.
- Prints inserted row counts per table.
- Is idempotent — safe to re-run.

### 7) Verify
- Run `npm run db:seed` — should print counts for all 4 tables.
- Open DB Browser for SQLite and confirm Hebrew text in each table.
- Run `npm run start:dev` and hit `GET /health`.

## Notes
- Do not implement search endpoints in this task — that is the next task.
- Do not implement vector indexing in this task.
- Keep seed data realistic enough to demonstrate meaningful search later.
- Vary decision reasons and conditions by product category.
- All human-readable text must be in Hebrew — this is a hard requirement.

## Definition of Done
- `sources/api/mock-jsons/` folder exists with all 4 JSON files in Hebrew.
- `npm run db:seed` completes without errors.
- `Country` table: 50 rows with Hebrew names.
- `Manufacturer` table: 50 rows with Hebrew names.
- `Product` table: 50 rows with Hebrew names, categories, ingredients, descriptions.
- `CommitteeDecision` table: 200 rows with Hebrew reason/conditions/risks text.
- `GET /health` returns `{ status: "ok" }`.
- All data visible in DB Browser for SQLite.
