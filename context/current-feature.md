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
- **Not yet verified**: an actual authenticated request (sign-in, insert)
  against the live project with the new key. The sandbox this was set up in
  blocks outbound network to `*.supabase.co`, so this needs to be confirmed
  from a normal dev machine.
- `.env.example` and the README still say "anon key" — harmless, but the
  naming is stale relative to what's actually configured.

## Goals

- [ ] Confirm the publishable key works end-to-end from a local machine
      (sign-in, insert, select all succeed against project
      `etwqprvkfbjcfqmugqnm`). Revert to the legacy `anon` JWT if it 401s.
- [ ] Rename `VITE_SUPABASE_ANON_KEY` → something accurate (e.g.
      `VITE_SUPABASE_PUBLISHABLE_KEY`) across `.env.example`,
      `src/lib/supabase.js`, and the README, once confirmed working.

# Upcoming Features

- [ ] Deploy to Cloudflare Pages or Netlify (pick one), wire up
      `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as platform env vars,
      confirm the GitHub OAuth callback/redirect URLs include the deployed
      domain.
- [ ] **Vitest** — unit tests around `src/lib/players.js` (Sleeper fetch +
      24h localStorage cache behavior) and `src/lib/supabase.js` /
      `CheatSheet.jsx` data layer (CRUD against the `players` table, RLS
      boundaries).
- [ ] **Manual Verification**: Manual end-to-end pass once deployed: sign in with GitHub, add players,
      tag position/team/tier, star sleepers, update rankings, sort, print,
      sign out and back in to confirm the board persisted.
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
