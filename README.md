# Parallel Selves

A persona-to-persona social matching platform built on the MEAN stack (MongoDB, Express, Angular, Node) with AI-powered compatibility narratives via Hugging Face Mistral-7B.

## Repo layout

```
.
├── server/       Express + MongoDB API: JWT auth, persona versioning, matching engine, Mistral-7B integration
├── client/       Angular 17 frontend: standalone components, reactive forms, HttpInterceptor, route guards, D3 graph
├── prototype/    Original static React prototype — UI reference, not part of the MEAN deliverable
└── uploads/      Source proposal (.docx)
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local install or a free MongoDB Atlas cluster)
- A Hugging Face account with a free API token (for the `/api/ai/report` endpoint — optional for backend demo, required for live AI narratives)

## First-time setup

```bash
# From repo root — installs both server and client deps
npm run install:all

# Create server env file from the template
cp server/.env.example server/.env
# Edit server/.env: fill in MONGO_URI, JWT_SECRET, HF_API_TOKEN
```

## Seed demo data

```bash
npm run seed
```

Populates MongoDB with 5 demo users, 11 personas, 55 pre-computed matches, and 2 sample AI reports. Re-run anytime to reset.

Default demo login: `krishna@parallel.app` / `demo1234`.

## Running in development

Open two terminals.

```bash
# Terminal 1 — API on http://localhost:5001
npm run server

# Terminal 2 — Angular dev server on http://localhost:4200
npm run client
```

The client's `environment.ts` points to `http://localhost:5001/api`. If you change the server port, update both places.

> macOS note: the API defaults to 5001 because macOS AirPlay Receiver occupies port 5000. If you need 5000, disable AirPlay Receiver in System Settings → General → AirDrop & Handoff.

## Feature map (proposal → implementation)

| Proposal feature | Backend | Frontend |
|---|---|---|
| User Auth & Route Guards | [auth.js](server/routes/auth.js), [middleware/auth.js](server/middleware/auth.js) | [auth.guard.ts](client/src/app/guards/auth.guard.ts), [auth.interceptor.ts](client/src/app/interceptors/auth.interceptor.ts) |
| Persona Builder (CRUD) | [personas.js](server/routes/personas.js) | [persona-list](client/src/app/components/persona-list), [persona-form](client/src/app/components/persona-form) |
| Persona-to-persona Matching Engine | [utils/matching.js](server/utils/matching.js), `POST /api/matches/score` | [match-dashboard](client/src/app/components/match-dashboard) |
| Compatibility Graph (D3 + Angular) | — | [graph](client/src/app/components/graph) — `d3.forceSimulation` over persona nodes; click edge → AI report |
| AI Compatibility Report | [routes/ai.js](server/routes/ai.js), [utils/huggingFace.js](server/utils/huggingFace.js) | [report-panel](client/src/app/components/report-panel) — slide-in drawer with live HF call + caching |
| Persona Drift History | PUT auto-snapshots, [models/PersonaVersion.js](server/models/PersonaVersion.js) | [drift-timeline](client/src/app/components/drift-timeline) — version history + side-by-side compare |

## REST API

All routes under `/api`. All except `auth/*` require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register user, returns JWT |
| POST | /auth/login | Login, returns JWT |
| GET | /personas | List current user's personas |
| POST | /personas | Create persona (max 5 per user) + snapshot v1 + re-score matches |
| PUT | /personas/:id | Update persona + bump version + snapshot + re-score |
| DELETE | /personas/:id | Delete persona + cascade matches + history |
| GET | /personas/:id/history | All versions, newest-first |
| GET | /matches | All matches touching current user's personas, sorted by score, populated |
| POST | /matches/score | Recompute every pair |
| GET | /matches/:id/report | Cached AI report |
| POST | /ai/report | Generate (or return cached) Mistral-7B compatibility narrative |
| GET | /health | `{ ok: true }` |

## Scoring algorithm

Defined in [server/utils/matching.js](server/utils/matching.js):

```
score = 0.4 × traitJaccard   (as 0–100)
      + 0.4 × interestJaccard (as 0–100)
      + 0.2 × goalAlignment   (100 if goals match, else 30)
```

Re-runs automatically on any persona create/update; bulk recompute via `POST /api/matches/score`.

## Angular architecture

- **Standalone components** — no NgModule glue. Each routed page is lazy-loaded via `loadComponent` in [app.routes.ts](client/src/app/app.routes.ts).
- **Services** expose `BehaviorSubject`/`Subject` streams so components subscribe via `async` pipe — no manual DOM manipulation.
- **JWT flow** — `AuthService` persists to `localStorage`; `authInterceptor` attaches `Authorization` to every request; `authGuard` redirects unauthenticated traffic to `/login`.
- **Theme** — [theme.service.ts](client/src/app/shared/theme.service.ts) flips body classes for light/dark + accent variants (violet/cyan/rose/lime), persisted to `localStorage`.
- **Graph** — `d3.forceSimulation` with `forceLink` (distance inverse to match score), `forceManyBody` repulsion, and `forceCollide`. Edge click opens the shared `ReportPanel` drawer.

## Deployment sketch

- **API**: Render.com / Railway.app. Set env vars: `MONGO_URI`, `JWT_SECRET`, `HF_API_TOKEN`, `HF_MODEL`, `PORT`.
- **Client**: `cd client && ng build` → serve `dist/client/browser/` from Netlify / Vercel / any static host. Before building, create `client/src/environments/environment.prod.ts` with the deployed API URL.

## Verified smoke tests

End-to-end, against Atlas:

1. `npm run seed` → 5 users, 11 personas, 55 matches, 2 seeded AI reports
2. Login with `krishna@parallel.app` → JWT issued, `GET /api/personas` returns 2 personas
3. `GET /api/matches` returns 19 matches (only those touching Krishna's personas), populated and sorted
4. Create → Update → Update on a test persona produced history `[v3, v2, v1]` correctly
5. Re-scoring auto-fires on persona updates
