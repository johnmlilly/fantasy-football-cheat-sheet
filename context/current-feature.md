# Current Feature

Supabase modern publishable API key migration

## Status

- `.env` (local, gitignored) switched from the legacy `anon` JWT to the modern
  `sb_publishable_...` key.
- `@supabase/supabase-js` is pinned at 2.112.4 (package-lock.json), which has
  explicit support for `sb_publishable_...` / `sb_secret_...` key formats
  (`isNewApiKey()` in the SDK) — confirmed by reading the installed source.
- App renders and the Supabase client constructs with no key-format warning
  from the SDK, verified via a headless Chromium smoke test.
- **Key verified against the live API** (2026-08-24, from local machine):
  `GET /rest/v1/players` → 200 `[]`, `GET /auth/v1/settings` → 200, and a
  deliberately bogus key → 401, so the 200s are real authentication rather
  than a permissive endpoint. The empty array is RLS working as intended —
  an unauthenticated caller matches no rows.
- GitHub auth provider confirmed enabled on the project
  (`/auth/v1/settings` reports `github: true`).
- Local build verified: `npm ci` + `npm run build` succeeds (379 kB bundle,
  108 kB gzipped).
- `.env.example` and the README still say "anon key" — harmless, but the
  naming is stale relative to what's actually configured.

## Upcoming Features

- [ ] **Vitest** — unit tests around `src/lib/players.js` (Sleeper fetch +
      24h localStorage cache behavior) and `src/lib/supabase.js` /
      `CheatSheet.jsx` data layer (CRUD against the `players` table, RLS
      boundaries).
- [ ] **Tailwind 4**: Remove tailwing.config file (used in version 3, deprecated in v4).
- [ ] **Try/Catch Improvement** - strengthen logic in try/catch inside player.ts file. Catches silently fail; need logging or other output to verify true errors for better testing.

## Archived — Features Already Implemented

<!-- Keep this updated. Earliest to latest -->

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
