# PROJECT.md

# AI Food Export Regulatory Decision Support Platform

## 1. Project Overview

This project is an end-to-end Proof of Concept for an AI-powered regulatory decision support system.

The system helps users ask questions about food export approvals and receive advisory answers based on historical committee decisions.

The system simulates a regulatory committee that reviews food export requests submitted by food manufacturers.

Each historical record represents a product that was reviewed by the committee and received one of the following outcomes:

- Approved
- Rejected
- Approved with conditions

The system should allow the user to ask natural-language questions in a ChatGPT-like web interface and receive a structured AI-assisted answer.

The AI does not replace the committee.

The AI acts as an advisor that helps retrieve relevant historical decisions, compare cases, identify risks, and suggest possible approval conditions.

Authentication and authorization are out of scope for the current version.

---

## 2. Main Goal

Build a complete working system that includes:

- SQL Server database
- Seed data with 1000 historical food export committee decisions
- NestJS backend API
- Angular frontend that looks and behaves like a ChatGPT-style chat interface
- Semantic search support
- Future-ready Vector DB integration
- Optional LLM and RAG-based recommendation flow

---

## 3. Business Scenario

A food manufacturer wants to export a product to a customer in another country.

Before approval, the product is reviewed by a committee.

The committee considers:

- Destination country
- Product name
- Product category
- Ingredients
- Manufacturer
- Previous committee decisions
- Required certificates
- Country-specific restrictions
- Health and food safety concerns
- Labeling requirements
- Laboratory requirements

The system should help users answer questions such as:

- Was a similar product approved before?
- Was a similar product rejected?
- What conditions were required?
- What risks should be checked?
- What previous decisions are relevant?
- What is the likely recommendation for a new request?

---

## 4. Example User Questions

The Angular chat screen should allow users to ask questions such as:

```text
Can we approve yellow cheese export to Germany?
```

```text
Find similar committee decisions for dairy products exported to France.
```

```text
What were the common rejection reasons for canned fish products in Japan?
```

```text
Which products with preservative X were approved with conditions?
```

```text
What risks should be checked before approving chocolate cookies for the USA?
```

```text
Has the committee approved similar products with palm oil before?
```

---

## 5. High-Level Architecture

```text
Angular Chat UI
        |
        v
NestJS API
        |
        +----------------------+
        |                      |
        v                      v
SQL Server DB            Vector DB
        |                      |
        +----------+-----------+
                   |
                   v
              RAG Service
                   |
                   v
             LLM Provider
                   |
                   v
        AI Recommendation Response
```

---

## 6. Technology Stack

### Frontend

- Angular
- TypeScript
- ChatGPT-like UI
- Responsive layout

### Backend

- Node.js
- NestJS
- TypeScript
- REST API

### Main Database

- SQL Server

### Seed Data

- SQL seed script
- 1000 historical product committee decision records

### Vector Database

Not selected yet.

The implementation should be designed so the Vector DB can be chosen later.

Possible options:

- Qdrant
- PostgreSQL + pgvector
- Azure AI Search
- Elasticsearch 8+
- OpenSearch
- Pinecone

### LLM

The project should support adding an LLM provider.

Possible options:

- Claude
- GPT
- Gemma

The first version may use a mock LLM service if needed.

---

## 7. Important Scope Decision

Do not implement authentication or authorization in the current version.

The current goal is to build and validate the business and technical flow.

Authentication can be added later.

---

## 8. Database Requirements

Create a SQL Server database for the POC.

The database should contain enough structured data to simulate a real committee decision history.

The schema should be simple but realistic.

Suggested core tables:

- Countries
- Products
- Manufacturers
- CommitteeDecisions

Optional tables may be added if needed:

- ProductCategories
- Ingredients
- ProductIngredients
- Regulations
- DecisionConditions
- ExportRequests

Keep the schema understandable and useful for the POC.

Do not over-engineer the schema unless there is a clear benefit.

---

## 9. Required Seed Data

Create seed data with at least:

- 1000 products / historical committee decision records
- Multiple destination countries
- Multiple product categories
- Multiple manufacturers
- Approved decisions
- Rejected decisions
- Approved-with-conditions decisions
- Realistic reasons
- Realistic risks
- Realistic approval conditions

The seed should include enough variety to make semantic search meaningful.

---

## 10. Example Product Categories

Seed data should include categories such as:

- Dairy
- Meat
- Fish
- Bakery
- Snacks
- Beverages
- Frozen Food
- Baby Food
- Canned Food
- Sauces
- Confectionery
- Organic Food
- Vegan Food
- Gluten-Free Food

---

## 11. Example Countries

Seed data should include countries such as:

- Germany
- France
- United States
- Japan
- United Kingdom
- Canada
- Australia
- Netherlands
- Italy
- Spain
- Singapore
- United Arab Emirates
- South Korea
- Brazil
- India

---

## 12. Example Decision Statuses

Each committee decision should have one of the following statuses:

```text
Approved
Rejected
Approved with conditions
```

---

## 13. Example Approval Conditions

The seed data should include realistic approval conditions such as:

- Local language labeling required
- Laboratory certificate required
- Allergen labeling required
- Cold chain documentation required
- Preservative concentration must be verified
- Heavy metal test required
- Shelf life documentation required
- Halal certificate required
- Veterinary certificate required
- Origin certificate required
- Packaging compliance required
- Nutritional declaration required
- Importer license required

---

## 14. Example Rejection Reasons

The seed data should include realistic rejection reasons such as:

- Missing laboratory certificate
- Ingredient not allowed in destination country
- Incomplete allergen declaration
- Labeling does not meet local requirements
- Product contains restricted additive
- Manufacturer documentation incomplete
- Cold chain process not documented
- Heavy metal test missing
- Shelf life validation missing
- Packaging does not meet food safety requirements

---

## 15. Semantic Search Requirement

The system should support semantic search over historical committee decisions.

Semantic search should allow the system to find similar cases even when the exact words are different.

Example:

A user asks about:

```text
Yellow cheese export to Germany
```

The system may retrieve historical cases about:

- Cheddar cheese
- Gouda cheese
- Dairy products
- Butter
- Yogurt
- Products with milk ingredients
- Germany dairy regulations

The search should not rely only on exact keyword matching.

---

## 16. Hybrid Search Requirement

The system should eventually support hybrid search.

Hybrid search means combining:

### Structured SQL Search

For exact filters:

- Country
- Product category
- Manufacturer
- Decision status
- Decision date
- Ingredients

### Semantic Vector Search

For similarity:

- Similar products
- Similar decisions
- Similar risks
- Similar conditions
- Similar rejection reasons

The first implementation may start simple, but the design should allow hybrid search later.

---

## 17. RAG Requirement

The system should be designed to support RAG.

RAG means:

```text
User Question
      |
      v
Retrieve relevant historical decisions
      |
      v
Send retrieved context to LLM
      |
      v
Generate grounded answer
```

The LLM should not answer only from its internal knowledge.

The LLM should answer based on retrieved data from the system.

---

## 18. LLM Responsibility

The LLM is responsible for:

- Understanding the user question
- Summarizing relevant historical decisions
- Comparing the current case to previous cases
- Explaining similarities and differences
- Identifying risks
- Suggesting possible approval conditions
- Producing a clear recommendation

The LLM is not responsible for storing knowledge.

The database and vector search are the source of truth.

---

## 19. AI Safety Rules

The AI must not claim that it has made the official decision.

The AI should always present its answer as an advisory recommendation.

Every AI answer should separate:

- Facts retrieved from data
- AI analysis
- Recommendation
- Confidence level
- Similar cases used as evidence

The AI must not invent committee decisions.

If no relevant historical data is found, the AI should clearly say so.

---

## 20. Backend API Requirements

Build a NestJS API.

Suggested endpoints:

### Health Check

```http
GET /health
```

Returns service status.

---

### Chat / Ask Question

```http
POST /chat
```

Request example:

```json
{
  "message": "Can we approve yellow cheese export to Germany?"
}
```

Response example:

```json
{
  "answer": "Based on similar historical dairy export decisions to Germany, approval may be possible with conditions.",
  "facts": [],
  "analysis": [],
  "recommendation": "Approved with conditions",
  "confidence": "Medium",
  "similarCases": []
}
```

---

### Recommendation API

```http
POST /recommendations
```

Request example:

```json
{
  "country": "Germany",
  "productName": "Yellow Cheese",
  "category": "Dairy",
  "ingredients": ["Milk", "Salt", "Preservative X"],
  "manufacturerName": "Example Dairy Ltd."
}
```

Response example:

```json
{
  "recommendation": "Approved with conditions",
  "confidence": "Medium-High",
  "risks": [
    "Preservative X must be verified against local limits"
  ],
  "suggestedConditions": [
    "German labeling required",
    "Laboratory certificate required"
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
  "explanation": "Similar dairy products were previously approved for Germany when labeling and preservative concentration were verified."
}
```

---

### Search Historical Decisions

```http
GET /decisions/search
```

Should support query parameters such as:

```text
country
category
status
productName
ingredient
```

---

### Rebuild Search Index

```http
POST /index/rebuild
```

Reads historical decisions from SQL Server and prepares them for semantic search.

In the first version, this can be implemented as a simple process.

Later it can create embeddings and store them in a real Vector DB.

---

## 21. Frontend Requirements

Build an Angular frontend.

The frontend should look like a simple ChatGPT-style interface.

Main UI requirements:

- Chat window
- Message input box
- Send button
- User messages aligned separately from assistant messages
- Loading indicator while waiting for response
- Display structured AI answer
- Display similar historical cases
- Display risks and suggested conditions
- Display confidence level

The frontend should call the NestJS API.

Authentication is not required.

---

## 22. Chat UI Behavior

The user should be able to type a natural-language question.

Example:

```text
Can we approve canned tuna export to Japan?
```

The system should return:

- A direct answer
- Relevant similar cases
- Risks
- Conditions
- Recommendation
- Confidence level

The UI should make it clear that the answer is advisory only.

---

## 23. Search Document Format

For semantic search, each historical committee decision should be converted into a text document.

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
Risk Level: Medium.
Decision Date: 2025-01-20.
```

This text will be used to generate embeddings.

---

## 24. Vector DB Abstraction

Do not hard-code a specific vector database.

Create an abstraction for semantic search.

The code should allow replacing the implementation later.

Example conceptual interface:

```typescript
interface VectorSearchService {
  indexDocument(document: SearchDocument): Promise<void>;
  searchSimilar(query: string, limit: number): Promise<SearchResult[]>;
  rebuildIndex(): Promise<void>;
}
```

The first implementation may be:

- In-memory mock search
- Simple keyword search
- Local embedding simulation

But the design should allow replacing it with a real Vector DB.

---

## 25. LLM Abstraction

Do not hard-code a specific LLM provider.

Create an abstraction for AI recommendations.

Example conceptual interface:

```typescript
interface LlmService {
  generateRecommendation(input: RecommendationPromptInput): Promise<RecommendationResult>;
}
```

Possible future implementations:

- Claude
- GPT
- Gemma
- Mock LLM for local development

---

## 26. Development Phases

### Phase 1 - Project Setup

- Create backend NestJS project
- Create frontend Angular project
- Create basic README
- Create environment files
- Create Docker support if useful

---

### Phase 2 - SQL Database and Seed

- Create SQL Server schema
- Create seed script
- Generate 1000 historical committee decisions
- Ensure realistic variation in products, countries, decisions, and conditions

---

### Phase 3 - Backend API

- Implement database access
- Implement search endpoints
- Implement recommendation endpoint
- Implement chat endpoint

---

### Phase 4 - Search Index

- Convert DB decisions into searchable documents
- Implement index rebuild flow
- Prepare abstraction for Vector DB
- Implement a first simple search mechanism

---

### Phase 5 - AI Recommendation

- Implement mock LLM first if needed
- Implement real LLM provider later
- Implement RAG prompt structure
- Return structured recommendation

---

### Phase 6 - Angular Chat UI

- Build ChatGPT-like screen
- Connect to backend API
- Show messages
- Show recommendation details
- Show similar cases

---

### Phase 7 - Vector DB Integration

- Choose Vector DB
- Generate real embeddings
- Store vectors
- Implement semantic similarity search
- Combine SQL filters with vector search

---

## 27. Out of Scope for Current Version

The following are currently out of scope:

- Authentication
- Authorization
- User management
- Production deployment
- Real regulatory data
- Real committee workflow
- Document upload
- Audit trail
- Role-based permissions
- Multi-tenant support

These may be added later.

---

## 28. Non-Functional Requirements

The system should be:

- Modular
- Maintainable
- Easy to understand
- Easy to extend
- Suitable for enterprise development
- Testable
- Clear in separation of concerns

Avoid over-engineering.

Prefer a working POC with clean architecture over a complex unfinished platform.

---

## 29. Success Criteria

The POC is successful if:

1. The SQL database is created.
2. The seed data includes 1000 historical committee decisions.
3. The NestJS API can search the data.
4. The Angular frontend allows users to ask questions.
5. The system can retrieve similar historical decisions.
6. The system can generate an advisory recommendation.
7. The recommendation includes risks, suggested conditions, similar cases, and confidence.
8. The system is ready for future Vector DB and LLM integration.

---

## 30. Long-Term Vision

The long-term vision is to build a full AI-powered regulatory decision support platform.

The first domain is food export approvals.

The same architecture may later support:

- Food import approvals
- Medicine approvals
- Product licensing
- Environmental regulation
- Government committee workflows
- Enterprise compliance workflows

The platform should be designed as a reusable decision-support foundation, not only as a single-purpose demo.
