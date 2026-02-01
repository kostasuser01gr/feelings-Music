# Aurelia — Feelings & Music

A single platform that merges **confessional album posts**, **music creation** (AI + DAW-lite + coding), and a **3D Cosmos** where songs launch as golden auras and connect people with filaments.

**Codename:** AURELIA

## Setup

1. **Clone and install**

   ```bash
   git clone <repo>
   cd "Feelings & Music"
   npm install --legacy-peer-deps
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill Firebase config:

   ```bash
   cp .env.example .env.local
   ```

   Create a [Firebase](https://console.firebase.google.com) project, enable **Authentication** (Email/Password), **Firestore**, and **Storage**. Add a web app and use its config in `.env.local`.

3. **Playwright (optional, for e2e)**

   ```bash
   npx playwright install
   ```

4. **Firestore indexes**

   Deploy composite indexes for queries:

   ```bash
   firebase deploy --only firestore:indexes
   ```

   Indexes are defined in `firestore.indexes.json`.

5. **Firestore & Storage rules**

   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

## Commands

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Next.js dev server       |
| `npm run build`| Production build               |
| `npm run start`| Run production server          |
| `npm run lint` | ESLint                         |
| `npm run typecheck` | TypeScript check         |
| `npm run test` | Vitest unit tests              |
| `npm run test:e2e` | Playwright e2e tests (run `npx playwright install` once first) |

## Routes

- **/** — Home
- **/sanctuary** — Confessions, feed, resonance
- **/studio** — Projects list
- **/studio/new** — New project (Lyrics, Arrangement, Code, Mix, Publish)
- **/cosmos** — 3D globe, pins, arcs, starfield, list view
- **/bands** — Bands; **/bands/[id]** — Band room
- **/settings** — Accessibility, shortcuts
- **/login**, **/signup** — Auth

## Shortcuts

- **⌘K** / **Ctrl+K** — Command palette
- **/** — Search (opens command palette)
- **⌘1** — Sanctuary, **⌘2** — Studio, **⌘3** — Cosmos
- **N** — New (contextual)
- **Shift+?** — Help overlay
- Shortcuts are remappable in Settings.

## Performance & accessibility

- Cosmos (3D) is **lazy-loaded**; heavy code runs only on `/cosmos`.
- **Reduce motion** (Settings) simplifies Cosmos animations and UI transitions.
- **Themes, high contrast, and font scale** live in Settings for accessibility.
- **List view** in Cosmos provides an accessible alternative to the 3D globe.
- Focus management, visible focus rings, and keyboard navigation throughout.

## Deployment (Vercel)

1. Connect the repo to [Vercel](https://vercel.com).
2. Set environment variables from `.env.example`.
3. Deploy. Build command: `npm run build`; output: Next.js default.

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Tailwind + shadcn-style (Radix) + Lucide
- **State:** Zustand + TanStack Query
- **Backend:** Firebase (Auth, Firestore, Storage)
- **3D:** React Three Fiber + drei
- **Audio:** Tone.js + Web Audio API
- **Collab:** Yjs (local-first; WebSocket provider optional)

## License

Private / Proprietary.
