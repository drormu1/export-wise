# Task: Angular Chat Client + Manufacturer→Products Endpoint

## Context
The NestJS API POC is done (health + seed). Next is a **very simple, ChatGPT-like Angular
screen**. The real semantic search (vector DB) doesn't exist yet, so we build a **temporary
placeholder query**: the user types a numeric manufacturer id → the app lists every product
that manufacturer makes.

Per decision, we add a real `manufacturerId` **foreign key to `Product`** (DB is regenerable,
so we update the schema and re-seed — no migration script). The chat's data call is isolated
in **one service method** so it can later be swapped for the vector-search call.

Two work items: **(A) backend** (schema FK + endpoints + CORS) and **(B) Angular client**, plus docs.

---

## Environment facts (confirmed)
- **Angular latest stable: v22** (web-confirmed). `npx @angular/cli@latest` resolves to it.
  Signal-first: standalone components, signals, `@if`/`@for`, `inject()` are the defaults.
- **Vite: not a separate step.** Angular v22's default builder uses esbuild (build) + Vite
  (dev server). No manual Vite install/config.
- API: NestJS 11 at `http://localhost:3000`. **No CORS** yet. Only `/health` exists —
  `/manufacturers*` endpoints must be built (part A).
- Mock data: 50 manufacturers (ids 1–50), Hebrew product fields (`name`, `category`, `sku`,
  `ingredients`, `description`). `sources/client/` is empty.

---

## Part A — Backend

### A1. Schema — `sources/api/database/schema.sql`
Add to `Product`: `manufacturerId INTEGER NOT NULL REFERENCES Manufacturer(id),`
Add `CREATE INDEX IF NOT EXISTS idx_product_manufacturer ON Product(manufacturerId);`
Update the SQL-Server migration note comment.

### A2. Seed FK — `sources/api/src/seed/seed.service.ts`
- Build a `code -> manufacturerId` map after inserting manufacturers.
- Derive each product's manufacturer code from its SKU prefix (`"TNV-001" -> "TNV"`; documented convention).
- Insert `Product` with resolved `manufacturerId`. If a prefix has no manufacturer → **throw** (no silent skip).

### A3. Fix orphan SKUs — `sources/api/mock-jsons/products.json`
`GLD-100` (ice cream) and `MTK-300` (chocolate) match no manufacturer. Reassign each to a
category-appropriate existing manufacturer code (dairy / confectionery), with unique SKUs.

### A4. Endpoints — new `sources/api/src/manufacturer/` module
Files: `manufacturer.module.ts`, `manufacturer.controller.ts`, `manufacturer.service.ts`
(uses global `DatabaseService`). Register in `app.module.ts`.
- `GET /manufacturers` → `{ manufacturers: [{ id, code, name, productCount }] }`
  (LEFT JOIN Product, GROUP BY, ORDER BY name). Helper for discovering valid ids.
- `GET /manufacturers/:id/products` (`ParseIntPipe`) →
  `{ manufacturer: { id, code, name }, products: [{ id, sku, name, category, ingredients, description }] }`.
  - Manufacturer not found → `NotFoundException` (404). No products → empty array (valid).

### A5. CORS — `sources/api/src/main.ts`
Add `app.enableCors()` (built into `@nestjs/platform-express`, no new dep). Dev proxy is the
primary mechanism; this is a safety net for direct calls.

### A6. Rebuild DB
`rm data/exportwise.db*` → `npm run db:init` → `npm run db:seed` (expect 50/50/50/200).

---

## Part B — Angular client (`sources/client/`)

### B1. Scaffold (installs deps — approved)
From `sources/`:
```bash
npx @angular/cli@latest new client --directory client --routing=false --style=css --ssr=false --skip-git --package-manager=npm
```
(`--routing=false`: single screen; `--style=css`: plain CSS, no UI framework; `--ssr=false`: SPA.)

### B2. Files (3 components — minimal but clean)
```
src/
  main.ts                         # bootstrapApplication(App, appConfig)
  styles.css                      # global reset + theme tokens
  app/
    app.ts / app.html / app.css   # thin root, hosts <app-chat>
    app.config.ts                 # provideHttpClient(withFetch())
    models/api.models.ts          # response + ChatMessage interfaces
    services/api.service.ts       # THE single swappable data method
    chat/chat.component.*          # smart: signal state + send flow
    chat/message-list.component.*  # dumb: renders history + product cards
    chat/chat-input.component.*    # dumb: autosize textarea + send
```

### B3. ApiService — the swap seam (`services/api.service.ts`)
```ts
private readonly base = '/api';                 // proxied to :3000 in dev
getManufacturers(): Observable<ManufacturersResponse>            // id discovery
askForProducts(query: string): Observable<ProductsResponse>     // <-- SINGLE SEAM
  // today: GET /manufacturers/{query}/products
  // later: swap body to vector search; keep signature + return shape stable
```
`ChatComponent` calls only `askForProducts` — never builds URLs itself.

### B4. State (signals in `ChatComponent`)
- `messages = signal<ChatMessage[]>([])`, `sending = signal(false)`.
- `ChatMessage = { id; role:'user'|'assistant'; text; products?; manufacturer?; state?:'loading'|'ok'|'empty'|'error' }`.
- **send flow:** validate input is integer 1–50 (else assistant `error`) → push user msg →
  push assistant `loading` msg → call `askForProducts` → patch that msg to `ok` /
  `empty` (0 products) / `error` (404 → "no manufacturer with that id"; else network error) →
  `sending=false`. Patch in place via `messages.update(...)`.

### B5. UI / CSS (ChatGPT-like, plain CSS)
- Full-height flex column; centered ~768px reading column; message list is the scrollable
  region; **sticky bottom input** bar.
- User bubble right-aligned (accent bg); assistant left-aligned (neutral). Product cards:
  bold name, category chip, monospace SKU, muted ingredients/description.
- **Hebrew:** wrap product content in `dir="rtl"` (app chrome stays LTR).
- Autosize `<textarea>`; **Enter = send, Shift+Enter = newline**; round send button.
- Clear `loading` (dots), `empty` ("אין מוצרים ליצרן זה"), `error` (red-tinted) states.
- Theme via CSS custom properties (`--accent` ChatGPT-green, neutral grays, system font).

### B6. Dev proxy — `sources/client/proxy.conf.json` (avoids CORS entirely)
```json
{ "/api": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "pathRewrite": { "^/api": "" } } }
```
Wire into `angular.json` → `serve.options.proxyConfig` so plain `npm start` uses it.
Browser calls are same-origin (`:4200/api/...`) → no CORS.

### B7. Run both
- API: `cd sources/api && npm run start:dev` (:3000)
- Client: `cd sources/client && npm start` (:4200, proxied)

---

## Part C — Docs
- **Update** `sub-context/client-context.md` — concrete POC scope (single chat screen, numeric
  manufacturer-id input, temporary products endpoint → later vector search, plain CSS, RTL Hebrew).
- **Update** `sub-context/api-context.md` — document `GET /manufacturers` and
  `GET /manufacturers/:id/products` as temporary placeholders until vector search.
- **Update** `my_tasks/db_schema.md` — note the new `Product.manufacturerId` FK.

---

## Verification
1. **Backend:** after re-seed, `curl localhost:3000/manufacturers` (list + productCount);
   `curl localhost:3000/manufacturers/1/products`; `curl localhost:3000/manufacturers/9999/products` → 404.
   `npm run typecheck` clean.
2. **Frontend:** `npm start`, open http://localhost:4200 →
   - id with products → product list (Hebrew, RTL);
   - id with 0 products → empty state;
   - `abc` / `999` → validation / error bubble.
3. DevTools Network: requests hit `:4200/api/...` (same-origin, 200s), no CORS errors.
4. Multi-turn history accumulates + auto-scrolls; input disabled only while in flight.

## Notes
- Dependency install: Angular app via `npx` (approved). No new API deps.
- Nothing committed automatically.
