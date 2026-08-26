# Current Feature

Server-side NFL player filtering via Cloudflare Worker (`/api/players`)

## Status

- Branch: `feature/players-api-worker`.
- **Problem**: `src/lib/players.js` fetched Sleeper's full player map
  (`/v1/players/nfl`) directly from the browser and filtered it client-side.
  Measured 2026-08-26: **13.97 MB** raw JSON down the wire on every cold cache,
  parsed and filtered on the client, to end up with **67 KB** of usable data
  (1032 fantasy-relevant players).
- **Fix**: the fetch + filter moved to the edge.
  - `src/lib/sleeper.js` (new) — `fetchFantasyPlayers()`, the shared fetch +
    filter. No DOM/browser deps, so both the Worker and the Vite dev
    middleware import it.
  - `worker/index.js` (new) — serves `GET /api/players` (JSON, 24h
    `cache-control`, backed by `caches.default`), returns 502 with an error
    body on Sleeper failure, and delegates everything else to `env.ASSETS`.
  - `wrangler.jsonc` — added `main`, `assets.binding: "ASSETS"`, and
    `assets.run_worker_first: ["/api/*"]`. 
  - `src/lib/players.js` — now fetches `/api/players`; the 24h localStorage
    cache is unchanged. 
  - `vite.config.js` — `playersApi()` dev middleware mirrors the Worker route
    so `npm run dev` behaves like production 
  - `src/components/PlayerForm.jsx` — the fetch is lazy: `loadPlayers()` fires
    on the search input's `onFocus`, guarded by a `useRef` so it runs at most
    once.
- Verified: `npm run build` passes; `wrangler deploy --dry-run` bundles the
  Worker and reports the `env.ASSETS` binding; `fetchFantasyPlayers()` run
  directly under Node returns 1032 players / 67 KB.

## Upcoming Features

- [ ] **Vitest** — unit tests around `src/lib/players.js` (cache behavior),
      `src/lib/sleeper.js` (filter), and `src/lib/supabase.js` /
      `CheatSheet.jsx` data layer (CRUD against the `players` table, RLS
      boundaries).
- [ ] **Tailwind 4**: Remove tailwing.config file (used in version 3, deprecated in v4).
- [ ] **Try/Catch Improvement** - strengthen logic in try/catch inside player.ts file. Catches silently fail; need logging or other output to verify true errors for better testing.
      Partly addressed: `getNflPlayers()` now throws on a bad API response, but
      `PlayerForm`'s `.catch(() => setNflPlayers([]))` still swallows it, so a
      failure is indistinguishable from "no matches".
- [ ] **Stale-while-revalidate** the localStorage cache so the 24h expiry is
      never a blocking wait.

## Archived — Features Already Implemented

- **Component extraction from `CheatSheet.jsx`** (422 → ~138 lines). Split into
  `src/components/`: `Header` (`onSignOut`), `PlayerForm` (`onAdd`; owns `form`,
  `showMatches`, `nflPlayers`), `Controls` (`sortMode`/`onSortChange`,
  `starredOnly`/`onStarredOnlyChange`), `PlayerList` (`groups`, `onToggleStar`,
  `onUpdatePlayer`, `onDeletePlayer`; owns `openRow`, contains `HeatMeter`),
  `Footer`. Shared constants moved to `src/lib/constants.js`. All supabase
  writes stay in `CheatSheet`; `addPlayer(form)` takes the form as an argument
  since it can no longer close over it. The `loading` gate was moved off the
  whole tree onto the `PlayerList` slot so `PlayerForm` mounts immediately and
  its fetch runs in parallel with the supabase query.
- Draft cheat sheet app scaffolded (Vite + React + Tailwind): search/tag/star/sort/print
  UI in `src/CheatSheet.jsx`, GitHub-OAuth-gated `src/App.jsx`, live NFL player
  search against Sleeper's free API cached 24h in localStorage
  (`src/lib/players.js`).
- Project committed to the repo (previously only existed as a chat-exported
  zip) and pushed to GitHub.
- Supabase schema applied to the live project (`etwqprvkfbjcfqmugqnm`):
  `players` table, row-level security enabled, policy scoping all access to
  `auth.uid() = user_id`.
- GitHub OAuth app configured and enabled as a Supabase auth provider by the
  user.
- Default branch renamed to `main`; local repo re-pointed to track
  `origin/main`.
- Deployed to Cloudflare Workers (not Pages/Netlify). `wrangler.jsonc` added
  at the repo root: assets-only Worker serving `./dist`, with
  `not_found_handling: "single-page-application"` so client-side routes and the
  OAuth return URL resolve instead of 404ing. Build-time `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` set under Settings → Build → Variables (not the
  runtime Variables and Secrets section — `import.meta.env` is inlined at
  build, so runtime bindings have no effect and the bundle throws
  `supabaseUrl is required.`). `signInWithOAuth` now passes
  `redirectTo: window.location.origin`, so one build serves both localhost and
  the Workers URL; both origins are on the Supabase redirect allowlist, and the
  GitHub OAuth app's callback stays pointed at Supabase's `/auth/v1/callback`.
- Vite upgraded 5.3.1 → 8.2.2, `@vitejs/plugin-react` 4.3.1 → 6.1.0.
- Manual end-to-end pass against the deployed app: GitHub sign-in, add players,
  tag position/team/tier, star sleepers, update rankings, sort, print, sign out
  and back in with the board persisted.
