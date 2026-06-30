# ExportWise - Client Context

## Quick Load References
- **Global rules:** `context.md`
- **API integration contract:** `sub-context/api-context.md`
- **Business data boundaries:** `sub-context/data-context.md`
- **Vector retrieval boundaries:** `sub-context/vector-context.md`

## Purpose
Define the frontend responsibilities for a clear, reliable AI-assisted experience.
The client is a presentation and interaction layer only.

## Frontend Stack
- Angular
- Chat-style user experience
- REST communication with backend API

## Architectural Separation (Client View)
The client must respect strict backend boundaries:
- SQL database is the business source of truth (backend-owned).
- Vector DB is the semantic retrieval layer (backend-owned).
- LLM is the advisory generation layer (backend-owned).

The Angular app must never access SQL, Vector DB, or LLM directly.
All interactions go through API contracts.

## Client Responsibilities
- Accept user questions and structured request inputs.
- Send requests to API endpoints.
- Display grounded advisory responses.
- Present similar cases, risks, limitations/conditions, and confidence.
- Show loading, empty-state, and error-state behaviors clearly.
- Always display advisory disclaimer text in the response view.

## Non-Responsibilities
- No business decision logic in the client.
- No direct retrieval/ranking logic in the client.
- No prompt orchestration in the client.
- No data enrichment or indexing execution in the client.

## User Experience Flow (Chat/Search)
1. User submits a question.
2. Client sends request to API.
3. Client shows loading state.
4. API returns retrieval-grounded answer.
5. Client renders:
   - answer
   - facts vs analysis
   - recommendation
   - confidence
   - risks
   - limitations/conditions
   - supporting similar cases
   - advisory disclaimer

## User Experience Flow (Data Load Trigger - Optional Admin Screen)
If the client exposes a controlled internal/admin action for enrichment:
1. User provides `iteration`.
2. Client calls API data-load endpoint.
3. Client displays load result metrics.
4. Client displays indexing status (success/partial/failed).

Note: this action is optional for UI scope and can stay outside public UI.

## Display Rules for Reliability
- Clearly separate factual evidence from AI analysis.
- Surface uncertainty when provided by API.
- Do not present output as an official approval/rejection decision.
- Keep wording consistent with "advisory support" positioning.

## Early POC UI Scope
- One primary chat/search screen
- Optional supporting cases panel
- Optional risks/conditions panel
- Simple and readable layout over feature complexity
