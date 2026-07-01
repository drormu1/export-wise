# ExportWise - Data Context

## Quick Load References
- **Global rules:** `context.md`
- **API load/retrieval contracts:** `sub-context/api-context.md`
- **Vector ownership and indexing:** `sub-context/vector-context.md`
- **Client consumption model:** `sub-context/client-context.md`

## Layer Separation (Mandatory)
1. **SQL Database** = business truth.
2. **Vector DB** = semantic index artifacts from SQL.
3. **LLM** = advisory reasoning only.

## SQL Database as Source of Truth
The SQL database is the authoritative source for all business entities and decisions.
Any conflict between SQL and other layers must be resolved in favor of SQL data.

## Database Provider Profile
- Default for current POC: SQLite
- Optional/target for future migration: SQL Server
- Data layer should stay provider-agnostic (`sqlite | sqlserver`).
- **Implemented via TypeORM** (`@nestjs/typeorm`): shared entities + repositories run on
  both providers. Switching is `DB_PROVIDER=sqlserver` plus the mssql connection vars —
  see `sources/api/src/database/data-source.options.ts`. Entities live in
  `sources/api/src/entities/`; POC uses `synchronize: true` (move to migrations before production).

## Base Seed Scope (POC)
Initial seed must load exactly:
- `manufacturers`: 200 records
- `countries`: 200 records
- `products`: 200 records

These records should include only essential fields required for the POC, while remaining realistic.

## License Decision Table (Generated Data)
Generated historical-like license decisions are stored in `licenses`.

Minimum fields:
- `manufacturer_code`
- `product_code`
- `country_code`
- `decision_status`
- `limitations`

Primary key:
- Composite key: (`manufacturer_code`, `product_code`, `country_code`)

Foreign key intent:
- `manufacturer_code` references `manufacturers`
- `product_code` references `products`
- `country_code` references `countries`

## Iteration-Based Mock Generation Tool
A side tool generates additional `licenses` records using:
- Input: `iteration`

Rules:
- Use only existing codes from SQL base tables.
- Create realistic and varied decision outcomes.
- Insert only non-conflicting composite keys.
- Skip existing keys without failing the full run.
- Allow repeated executions to continuously enrich data.

Recommended run outputs:
- `generatedCandidatesCount`
- `insertedCount`
- `skippedConflictsCount`
- `failedCount` (if any)

## SQL -> Vector Synchronization (High-Level Contract)
After every successful iteration-based SQL enrichment run, a Vector indexing run is mandatory.
Detailed Vector indexing behavior, ownership boundaries, failure handling, and retrieval contracts are defined in:
- `sub-context/vector-context.md`

## LLM Data Consumption Rules
- LLM receives context from retrieval outputs (SQL + Vector).
- LLM must not be treated as storage or historical memory.
- Every recommendation should be grounded in retrieved cases.
- If evidence is weak, the response must explicitly state uncertainty.

## Search Document Ownership
`licenses` records are the business source for retrieval document generation.
Document structure and indexing rules are maintained in:
- `sub-context/vector-context.md`

## Data Quality Requirements
- Referential integrity across all relations
- Stable and validated codes
- Controlled decision status vocabulary
- Non-empty critical fields (`decision_status`, key codes)
- Consistent text normalization for search fields

## Operational Reliability (Data Layer)
- Re-run support is required without corrupting SQL truth.
- Monitoring should allow verifying SQL growth by iteration.
- Vector indexing observability requirements are defined in `sub-context/vector-context.md`.
