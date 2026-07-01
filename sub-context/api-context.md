# ExportWise - API Context

## Quick Load References
- **Global rules:** `context.md`
- **Data ownership:** `sub-context/data-context.md`
- **Vector indexing/retrieval:** `sub-context/vector-context.md`
- **Client contract:** `sub-context/client-context.md`

## Scope (Strict)
The API has two responsibilities only:
1. Data loading/enrichment.
2. AI-facing search and retrieval.

No broad business workflow orchestration in this phase.

## Database Provider Policy
- Current default provider: SQLite
- Optional/target provider: SQL Server
- API contracts must remain database-provider neutral.

## Functional Areas
### 1) Data Load
- Trigger seed/enrichment flows.
- Accept `iteration`-based load requests.
- Return insert/skip/failure counters.
- Return indexing status.

Suggested endpoints:
- `POST /data/load/seed` (optional)
- `POST /data/load/licenses?iteration={n}`
- `GET /data/load/status/{jobId}` (optional)

### 2) AI Search
- Accept query + optional filters.
- Perform hybrid retrieval (SQL + Vector).
- Return ranked supporting evidence for LLM grounding.

Suggested endpoints:
- `POST /ai/search`
- `POST /ai/chat`

### 2a) Temporary Query Placeholder (until Vector DB exists)
Until semantic search is implemented, the client's query is served by a simple
SQL lookup by manufacturer. These endpoints are a stopgap and will be superseded
by `/ai/search`:
- `GET /manufacturers` → `{ manufacturers: [{ id, code, name, productCount }] }`
  (helper to discover valid manufacturer ids).
- `GET /manufacturers/:id/products` → `{ manufacturer: { id, code, name }, products: [...] }`;
  `404` if the id is unknown; empty `products` is a valid result.
Backed by the `Product.manufacturerId` FK. The Angular client isolates this call in a
single service method so it can be swapped for `/ai/search` later.

## Mandatory Post-Load Contract
After each successful iteration load:
1. Persist new SQL `licenses` rows (non-conflicting composite keys).
2. Build/refresh search documents.
3. Generate embeddings.
4. Upsert to Vector DB.
5. Expose clear success/failure status.

The flow must not stop silently after SQL insert.

## Minimal Contracts
- **Load request:** `iteration`
- **Load response:** `insertedCount`, `skippedConflictsCount`, `indexedCount`, `indexingStatus`, optional `jobId`
- **Search request:** `query`, optional `filters`, optional `topK`
- **Search response:** `answer`, `facts`, `analysis`, `recommendation`, `confidence`, `risks`, `limitationsOrConditions`, `similarCases`, `disclaimer`

## Guardrails
- Never present AI output as official decision.
- Never return ungrounded claims as facts.
- Preserve traceability to retrieved records.
