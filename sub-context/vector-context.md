# ExportWise - Vector Context

## Quick Load References
- **Global rules:** `context.md`
- **Data source ownership:** `sub-context/data-context.md`
- **API retrieval contracts:** `sub-context/api-context.md`
- **Client behavior expectations:** `sub-context/client-context.md`

## Purpose
This document defines the Vector DB layer responsibilities, contracts, and operational behavior.
It exists to keep a clean architectural separation from:
- SQL database business data ownership
- LLM reasoning and response generation

## Layer Boundaries

### SQL Database
- Owns business truth.
- Owns canonical entity and decision records.

Provider note:
- Current default: SQLite
- Optional/target: SQL Server

### Vector DB
- Owns semantic index artifacts only.
- Stores embeddings and retrieval metadata derived from SQL data.
- Must never be treated as canonical business storage.

### LLM
- Consumes retrieved evidence.
- Produces advisory output.
- Must not store or invent business facts.

## Input Source Rule
All vectorized documents must originate from SQL records only.
No manual business writes directly to Vector DB outside controlled indexing flows.

## Document Construction Contract
Each indexed document should include:
- Composite identity: `manufacturer_code`, `product_code`, `country_code`
- Human-readable fields for retrieval relevance:
  - manufacturer context
  - product context
  - country context
  - decision status
  - limitations
- Optional ranking/filter metadata tags
- Source reference fields for traceability to SQL rows

## Indexing Trigger Rules
Vector indexing is mandatory after each successful iteration-based SQL enrichment run.

Required sequence:
1. Detect newly inserted or changed SQL records.
2. Build normalized retrieval documents.
3. Generate embeddings.
4. Upsert into Vector DB.
5. Record success/failure per batch.

## Idempotency and Conflict Behavior
- Re-running the same indexing operation must be safe.
- Duplicate document keys must result in deterministic upsert behavior.
- Partial batch failures must be isolated and reportable.

## Failure Handling
- Indexing must never fail silently.
- The system must expose:
  - total attempted documents
  - indexed documents
  - failed documents
  - retryable failure details
- Safe retry must be supported without corrupting index consistency.

## Deletion and Update Policy
- SQL updates must eventually propagate to Vector DB.
- SQL deletes should mark/remove corresponding vector documents through a controlled sync rule.
- Drift between SQL and Vector must be detectable.

## Retrieval Contract for API
The API retrieval layer should use Vector DB for semantic similarity and combine with SQL context when needed.

Expected output for downstream LLM grounding:
- top relevant cases
- similarity/relevance score
- source identity (composite key)
- key evidence snippets

## Observability
Minimum monitoring signals:
- indexing throughput by run
- indexing failure rate
- index lag from latest SQL iteration
- retrieval hit quality indicators

## Extensibility
The implementation must remain provider-agnostic through a Vector abstraction.
Potential providers may include Qdrant, PostgreSQL + pgvector, Azure AI Search, Elasticsearch, or others.

Switching provider must not require business-layer rewrites.
