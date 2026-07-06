# BHUMI — Frontend

Two frontend applications serve BHUMI: a **Docs Viewer** (for browsing planning docs) and the upcoming **RSK Dashboard** (for ward officers managing farmers, alerts, and health cases).

---

## 1. Kisan Alert Docs Viewer

A standalone Vite + TypeScript micro-site that renders the project's planning documents (`01_PRD.md` → `10_VIBECODING_PROMPTS.md`) as a browsable, theme-aware documentation portal.

### Stack

| Layer | Choice | Why |
|---|---|---|
| Bundler | Vite 8 | Fast dev server, zero-config TS support, instant HMR |
| Language | TypeScript 6 | Type safety without a framework overhead |
| Markdown | `marked` (CDN) | Client-side MD → HTML rendering, no build step for content |
| Syntax HL | `highlight.js` (CDN) | Code block highlighting for schema/API docs |
| Hosting | Vercel (`vercel.json` included) | Static deploy, free tier, instant previews |

### Setup & Dev

```bash
cd frontend/
npm install
npm run dev       # → http://localhost:5173
```

### Build for production

```bash
npm run build     # outputs to frontend/dist/
npm run preview   # serves the built output locally
```

### How it works

The app loads Markdown files from `public/md/` via `fetch`, parses them with `marked`, and renders into a single-page layout with:

- **Top nav** with links to each planning doc
- **Dark/light theme toggle** (persisted in `localStorage`)
- **Download button** for the active document
- **Client-side routing** via `?doc=` query param + `popstate`

All content is static — no backend calls, no database. The docs mirror the files in `../BWA/`.

---

## 2. RSK Dashboard (Ward Officer Panel)

The primary farmer-facing operational dashboard is planned as a **vanilla JS SPA** (no framework, no build step) served directly by the FastAPI backend or hosted independently.

### Planned sections (per `07_API_SPEC.md`)

| Section | Source | Description |
|---|---|---|
| Farmer list | `GET /dashboard/farmers` | Name, ward, current crop, phone, latest alert status |
| Active alerts | `GET /dashboard/alerts` | Color-coded by status (red = no response, yellow = pending, green = acknowledged) |
| Health cases | `GET /dashboard/health-logs?status=flagged_for_rsk` | Photo thumbnail, diagnosis, confidence badge, "Mark Resolved" action |
| Recommendation view | Nested per farmer | Shows `source_data` (soil, rainfall, groundwater) alongside AI recommendation for transparency |

### Design constraints (from `01_PRD.md` §6)

- **Must be understandable by a non-technical viewer in under 5 minutes** (judging criterion)
- Icon/color-coded urgency (red/yellow/green) — minimal dense text
- Simple language toggle (EN / HI) for UI labels
- Lightweight — no heavy JS bundles, works on low-end devices

### Auth

Dashboard endpoints are protected by **Firebase ID tokens**. The RSK officer logs in via Firebase Authentication, and the frontend includes the token in `Authorization: Bearer <token>` headers.

### Development plan

1. Build `dashboard.html` + `dashboard.js` + `dashboard.css` — single page, no framework
2. Wire up all 5 dashboard endpoints from the backend
3. Add language toggle via a small JS translation object
4. Serve via FastAPI static files mount or deploy separately on Vercel

---

## Project structure

```
frontend/
├── index.html             Entry point for the Docs Viewer
├── package.json           Vite + TypeScript deps
├── tsconfig.json          TypeScript config
├── vercel.json            Vercel deploy config
├── src/
│   ├── main.ts            Docs Viewer app logic
│   └── style.css          Global styles + theme vars
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── md/                Planning doc markdown files
├── dashboard/             (planned) RSK Dashboard files
│   ├── dashboard.html
│   ├── dashboard.js
│   └── dashboard.css
└── README.md              This file
```

---

## Data flow (Dashboard)

```
Browser ──GET /dashboard/farmers──► FastAPI ──► Firestore
         ◄── JSON response ──────────          (farmers + plots + alerts)
         │
         ──GET /dashboard/alerts────► FastAPI ──► Firestore (alerts)
         ◄── JSON with ui_color ────
         │
         ──GET /dashboard/health-logs─► FastAPI ──► Firestore (health_logs)
         ◄── JSON ────────────────────
         │
         ──PATCH /health/log/{id}/resolve──► FastAPI ──► Firestore
         ◄── 200 OK ───────────────────────
```

---

## Related planning docs

See `../BWA/` for the full set of planning documents: PRD, architecture, schema, API spec, Gemini prompts, and real-data integration notes.
