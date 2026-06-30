# ExportWise - Global Project Context

## Purpose
ExportWise is an AI-assisted decision-support system for food export approvals.
The AI is advisory only; the final decision always belongs to the human committee.

## Quick Load References
- **Always load first:** `context.md`
- **API behavior:** `sub-context/api-context.md`
- **Business data model:** `sub-context/data-context.md`
- **Vector/indexing rules:** `sub-context/vector-context.md`
- **Frontend scope:** `sub-context/client-context.md`
- **Deep architecture reference:** `architecture.md`
- **Project-level reference:** `PROJECT.md`

## Startup MD Loading Policy
- At startup, load only the Markdown files explicitly listed in **Quick Load References**.
- Do not auto-load any other `.md` file unless the user explicitly asks for it.

## Non-Negotiable Rules
- The SQL database is the source of truth for business data.
- SQLite is the default database for current POC development.
- SQL Server compatibility should be preserved for future migration/dual-run.
- Vector DB stores retrieval/index artifacts derived from SQL.
- LLM is used for analysis and explanation, not as data storage.
- AI answers must separate facts from analysis and include an advisory disclaimer.
- No invented historical decisions.

## Database Profile (Current)
- Default provider: SQLite
- Optional/target provider: SQL Server
- Design rule: keep data access provider-agnostic (`sqlite | sqlserver`)

## Phase-1 Data Foundation
Required base seed:
- `manufacturers` (200 records)
- `countries` (200 records)
- `products` (200 records)

Generated table:
- `licenses` with composite key (`manufacturer_code`, `product_code`, `country_code`)
- Minimum fields: `manufacturer_code`, `product_code`, `country_code`, `decision_status`, `limitations`

## Iteration Tool Contract
A side tool accepts `iteration` and enriches `licenses` using valid base-table codes.
It inserts only non-conflicting composite keys and can run repeatedly.

## Mandatory SQL -> Vector Sync
Every successful enrichment iteration must trigger indexing:
1. Persist new `licenses` records in SQL.
2. Build/refresh retrieval documents from SQL data.
3. Generate embeddings.
4. Upsert into Vector DB.
5. Expose indexing status and retry-safe failure details.

Silent indexing failure is not allowed.

## Runtime Retrieval Flow
1. Angular sends request to API.
2. API retrieves evidence (SQL + Vector).
3. API builds grounded LLM context.
4. LLM returns structured advisory output.
5. API returns recommendation, confidence, risks, conditions, and similar supporting cases.

## Out of Scope (Current POC)
- Authentication/authorization
- Full workflow governance
- Production hardening
