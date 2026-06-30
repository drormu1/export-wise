# architecture.md

# AI Food Export Regulatory Decision Support Platform - Architecture

## 1. Purpose

This document describes the target architecture for the AI Food Export Regulatory Decision Support Platform.

The goal is to guide implementation without forcing unnecessary low-level design decisions too early.

The system should be built as a complete end-to-end POC that includes:

- SQL Server database
- Seed data with 1000 historical committee decisions
- NestJS backend API
- Angular frontend with ChatGPT-like experience
- Search layer
- Future-ready Vector DB integration
- Optional LLM / RAG recommendation flow

Authentication and authorization are currently out of scope.

---

## 2. Architecture Philosophy

This project should be treated as:

```text
Search Engine + AI Analyst
```

The search engine retrieves relevant evidence.

The AI analyst explains what the evidence means.

The LLM must not be treated as the source of truth.

The source of truth is the application data:

- SQL Server
- Historical committee decisions
- Product data
- Country data
- Approval / rejection reasons
- Conditions and risks

The AI should only analyze retrieved data and generate an advisory response.

---

## 3. High-Level System Diagram

```text
+-----------------------------+
|        Angular Frontend     |
|  ChatGPT-like User Interface|
+--------------+--------------+
               |
               | HTTP / REST
               v
+--------------+--------------+
|          NestJS API          |
|                              |
|  Chat Controller             |
|  Recommendation Controller   |
|  Decision Search Controller  |
+--------------+--------------+
               |
               v
+--------------+--------------+
|      Application Services    |
|                              |
|  Chat Service                |
|  Recommendation Service      |
|  Decision Search Service     |
|  Indexing Service            |
|  RAG Orchestration Service   |
+------+---------------+-------+
       |               |
       |               |
       v               v
+------+-------+   +---+----------------+
| SQL Server   |   | Vector Search Layer |
| Main DB      |   | Abstraction         |
+------+-------+   +---+----------------+
       |               |
       |               v
       |          +----+----------------+
       |          | Vector DB           |
       |          | Not selected yet    |
       |          +---------------------+
       |
       v
+------+----------------+
| LLM Provider Layer    |
| Claude / GPT / Gemma  |
| or Mock LLM           |
+-----------------------+
```

---

## 4. Main Components

## 4.1 Angular Frontend

The frontend should provide a simple ChatGPT-like user experience.

Primary responsibilities:

- Display chat messages
- Allow the user to ask natural-language questions
- Send questions to the NestJS API
- Display AI answer
- Display similar historical cases
- Display risks
- Display suggested approval conditions
- Display confidence level
- Clearly show that the answer is advisory only

The frontend should not contain business logic.

It should call the backend API.

---

## 4.2 NestJS Backend API

The backend is the central orchestration layer.

Primary responsibilities:

- Expose REST endpoints
- Validate request DTOs
- Read historical decisions from SQL Server
- Search decisions
- Prepare context for AI
- Call LLM provider when configured
- Return structured answers to the frontend
- Keep AI, search, and data access separated

The backend should be modular and maintainable.

Avoid placing all logic directly inside controllers.

---

## 4.3 SQL Server Database

SQL Server is the main source of truth.

It should contain the POC database and seed data.

The first version should include approximately 1000 historical committee decision records.

Core data should include:

- Countries
- Products
- Manufacturers
- Committee decisions

Optional data may include:

- Categories
- Ingredients
- Product ingredients
- Decision conditions
- Regulations
- Export requests

The schema should stay simple enough for a POC but realistic enough to demonstrate meaningful search and recommendation behavior.

---

## 4.4 Seed Data

Seed data is critical for this POC.

The system currently does not have real historical data.

Therefore, the seed must simulate realistic committee history.

The seed should include:

- 1000 historical decisions
- Multiple countries
- Multiple food categories
- Multiple manufacturers
- Approved decisions
- Rejected decisions
- Approved-with-conditions decisions
- Realistic decision reasons
- Realistic risks
- Realistic approval conditions

The seed should be varied enough to support semantic similarity.

For example, dairy products should include cheese, butter, yogurt, milk powder, cream, and similar products.

Fish products should include canned tuna, salmon, sardines, frozen fish, etc.

Bakery products should include cookies, bread, cakes, crackers, and snacks.

---

## 5. Data Model - Conceptual

The exact schema can evolve, but the conceptual model should support the following:

```text
Country
  - id
  - name
  - region

Manufacturer
  - id
  - name

Product
  - id
  - name
  - category
  - ingredients
  - description

CommitteeDecision
  - id
  - country
  - product
  - manufacturer
  - decisionStatus
  - decisionReason
  - conditions
  - risks
  - decisionDate
```

The implementation may normalize more tables if needed, but avoid over-engineering for the first POC.

---

## 6. Search Architecture

The system should support two search modes.

---

## 6.1 Structured Search

Structured search uses SQL fields and filters.

Examples:

- country = Germany
- category = Dairy
- decisionStatus = Approved with conditions
- ingredient contains Milk
- manufacturer = Example Dairy Ltd.

Structured search is useful when the user asks precise questions.

Example:

```text
Show rejected dairy products for Germany.
```

---

## 6.2 Semantic Search

Semantic search finds similar meaning, not only exact words.

Example:

User asks:

```text
Can we approve yellow cheese export to Germany?
```

Semantic search may retrieve cases involving:

- Cheddar cheese
- Gouda cheese
- Dairy products
- Butter
- Yogurt
- Products with milk ingredients
- German labeling requirements

Semantic search should be implemented behind an abstraction because the final Vector DB is not selected yet.

---

## 6.3 Hybrid Search

The desired future state is hybrid search.

Hybrid search combines:

```text
SQL filters + Vector similarity
```

Example:

```text
Find similar cases to yellow cheese, but prefer Germany and dairy products.
```

This may be implemented as:

1. Use SQL filters to narrow candidates.
2. Use vector search to find semantic similarity.
3. Re-rank results.
4. Send the top results to the LLM.

---

## 7. Vector DB Strategy

The Vector DB has not been selected yet.

The implementation should not depend directly on one vendor.

Possible future options:

- Qdrant
- PostgreSQL + pgvector
- Azure AI Search
- Elasticsearch 8+
- OpenSearch
- Pinecone

Create a clean abstraction for vector search.

Conceptual interface:

```typescript
interface VectorSearchPort {
  indexDocument(document: SearchDocument): Promise<void>;
  searchSimilar(query: string, limit: number): Promise<SearchResult[]>;
  rebuildIndex(): Promise<void>;
}
```

First implementation options:

- Mock vector search
- In-memory search
- Keyword-based fallback
- Simple embedding simulation

Later implementation:

- Real embeddings
- Real Vector DB
- Similarity search
- Hybrid search

---

## 8. Search Document Design

Each committee decision should be converted into a searchable text document.

Example:

```text
Country: Germany.
Product: Yellow Cheese.
Category: Dairy.
Ingredients: Milk, Salt, Preservative X.
Manufacturer: Example Dairy Ltd.
Decision: Approved with conditions.
Reason: Similar dairy products were previously approved when labeling and preservative limits were verified.
Conditions: German labeling required. Laboratory certificate required.
Risks: Preservative X must be checked against local limits.
Decision Date: 2025-01-20.
```

This text can be used for:

- Embedding generation
- Semantic search
- LLM context
- Debugging search results

---

## 9. RAG Architecture

The project should support RAG.

RAG means Retrieval-Augmented Generation.

Flow:

```text
User Question
      |
      v
Understand request
      |
      v
Retrieve relevant historical decisions
      |
      v
Build prompt with retrieved context
      |
      v
Call LLM
      |
      v
Return grounded answer
```

The LLM should not answer from memory only.

It should answer based on retrieved committee decisions.

---

## 10. LLM Provider Strategy

Do not hard-code the system to a single LLM provider.

Possible providers:

- Claude
- GPT
- Gemma
- Mock LLM for local development

Create an abstraction.

Conceptual interface:

```typescript
interface LlmProvider {
  generateRecommendation(input: RecommendationInput): Promise<RecommendationOutput>;
}
```

The first implementation may use a mock LLM to allow development without API keys.

Later, a real provider can be added.

---

## 11. Recommendation Flow

Recommended flow for `POST /recommendations`:

```text
1. Receive structured export request.
2. Validate input.
3. Build search query from country, product, category, ingredients.
4. Search historical committee decisions.
5. Retrieve top similar cases.
6. Build AI context.
7. Call LLM or mock LLM.
8. Return structured recommendation.
```

Expected response sections:

- Recommendation
- Confidence
- Risks
- Suggested conditions
- Similar cases
- Explanation
- Advisory disclaimer

---

## 12. Chat Flow

Recommended flow for `POST /chat`:

```text
1. Receive natural-language message.
2. Detect intent if needed.
3. Search relevant historical data.
4. Build RAG context.
5. Call LLM or mock LLM.
6. Return answer and supporting cases.
```

The chat endpoint is for natural language.

The recommendation endpoint is for structured product approval requests.

Both can reuse the same search and recommendation services.

---

## 13. API Boundary

Suggested endpoints:

```http
GET /health
```

```http
POST /chat
```

```http
POST /recommendations
```

```http
GET /decisions/search
```

```http
POST /index/rebuild
```

Additional endpoints may be added if useful.

Keep the API simple for the POC.

---

## 14. Angular UI Architecture

The Angular app should start simple.

Main screens:

- Chat screen
- Optional decision details panel
- Optional similar cases panel

Main UI behavior:

- User enters question
- Message appears in chat
- Loading indicator appears
- API returns answer
- Assistant answer appears
- Similar cases can be displayed under the answer
- Risks and conditions should be easy to read

The UI should clearly mark the AI answer as advisory.

---

## 15. Separation of Responsibilities

## Frontend

Responsible for:

- User interaction
- Display
- Calling backend API

Not responsible for:

- AI logic
- Search logic
- Business rules

## Backend

Responsible for:

- API
- Orchestration
- Search
- RAG
- LLM integration
- Data access

## SQL Server

Responsible for:

- Structured data
- Historical decisions
- Source of truth

## Vector DB

Responsible for:

- Semantic similarity search

## LLM

Responsible for:

- Summarization
- Reasoning
- Explanation
- Recommendation text

Not responsible for:

- Official decision
- Storing business data
- Inventing facts

---

## 16. AI Response Contract

AI answers should be structured.

Suggested response shape:

```json
{
  "answer": "Based on similar historical decisions, approval may be possible with conditions.",
  "facts": [
    "Three similar dairy products were approved for Germany."
  ],
  "analysis": [
    "The current product is similar to previous dairy products but contains a preservative that requires verification."
  ],
  "recommendation": "Approved with conditions",
  "confidence": "Medium-High",
  "risks": [
    "Preservative concentration must be verified."
  ],
  "suggestedConditions": [
    "German labeling required.",
    "Laboratory certificate required."
  ],
  "similarCases": [
    {
      "id": 101,
      "country": "Germany",
      "productName": "Cheddar Cheese",
      "decisionStatus": "Approved with conditions",
      "similarityScore": 0.87
    }
  ],
  "disclaimer": "This is an advisory recommendation only. The final decision belongs to the committee."
}
```

---

## 17. AI Guardrails

The system must enforce these rules:

- The AI must not say it has approved or rejected the export request officially.
- The AI must not invent historical committee decisions.
- The AI must clearly say when there is not enough information.
- The AI must separate facts from analysis.
- The AI must include supporting similar cases when possible.
- The AI must keep the committee as the final decision maker.

---

## 18. Development Phases

## Phase 1 - Foundation

- Create NestJS API
- Create Angular app
- Create SQL schema
- Create seed data
- Add health endpoint

## Phase 2 - Data and Search

- Load 1000 historical records
- Implement SQL search
- Convert decisions to search documents
- Add index rebuild endpoint

## Phase 3 - Mock Semantic Search

- Add vector search abstraction
- Implement mock or simple local search
- Return similar cases

## Phase 4 - AI Recommendation

- Add LLM abstraction
- Implement mock LLM
- Add RAG prompt structure
- Return structured AI response

## Phase 5 - Chat UI

- Build ChatGPT-like Angular screen
- Connect to `/chat`
- Display structured answer

## Phase 6 - Real Vector DB

- Choose Vector DB
- Generate embeddings
- Store vectors
- Implement real semantic search

## Phase 7 - Real LLM

- Add real provider
- Improve prompts
- Add response validation
- Add better citations to similar cases

---

## 19. Key Architectural Decisions

## Decision 1: SQL Server is the source of truth

Reason:

The business data is structured and relational.

## Decision 2: Vector DB is behind an abstraction

Reason:

The final Vector DB is not selected yet.

## Decision 3: LLM is behind an abstraction

Reason:

The final LLM provider may change.

## Decision 4: RAG is the target AI pattern

Reason:

The AI should answer based on retrieved project data, not from general model memory.

## Decision 5: Angular frontend is independent from backend internals

Reason:

The frontend should only depend on API contracts.

## Decision 6: No authentication in the first version

Reason:

The current goal is to validate the decision-support workflow.

---

## 20. What Not To Do

Do not:

- Build authentication now.
- Over-engineer the database.
- Hard-code a specific Vector DB.
- Hard-code a specific LLM provider.
- Let the AI invent facts.
- Put all backend logic in controllers.
- Make the frontend responsible for business decisions.
- Treat the LLM as the database.
- Build too many features before the basic flow works.

---

## 21. Success Criteria

The architecture is successful if:

1. A user can open the Angular app.
2. The user can ask a question in a ChatGPT-like screen.
3. The NestJS API receives the question.
4. The API searches historical committee decisions.
5. The system retrieves similar cases.
6. The system generates an advisory answer.
7. The answer includes risks, conditions, confidence, and supporting cases.
8. The architecture can later support a real Vector DB and real LLM provider.

---

## 22. Long-Term Extension Points

Future extensions may include:

- Authentication
- Role-based permissions
- Audit logs
- Real regulatory documents
- Document upload
- Committee feedback
- Decision workflow
- Knowledge graph
- Multi-language support
- Advanced analytics
- External regulation APIs
- Production deployment
