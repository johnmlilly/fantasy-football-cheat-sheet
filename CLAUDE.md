# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci            # install (lockfile-exact; prefer over npm install)
npm run dev       # Vite dev server on :5173
npm run build     # production build to dist/
npm run preview   # serve the built dist/
```

No test runner and no linter are configured yet. Vitest is planned — see
`context/current-feature.md`. Until then `npm run build` is the only automated
check; it catches JSX/import errors but nothing about behavior.

## Setup required before the app will run

1. `.env` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   Copy `.env.example`.
2. `sql/schema.sql` applied to the Supabase project.
3. GitHub OAuth configured — see the two-hop note below.

Anything prefixed `VITE_` is inlined into the client bundle by Vite. Only
publishable/anon-class keys belong there; a service-role key would be exposed
to every visitor.

## Architecture

### Two data sources with distinct roles

- **Sleeper API** (`api.sleeper.app`, keyless) — the read-only NFL player
  catalog. `src/lib/players.js` fetches the full ~5MB player map, filters to
  fantasy positions, and caches the result in `localStorage` for 24h. This is
  the source of truth for player **name, position, and team**.
- **Supabase** (`src/lib/supabase.js`) — the user's own board: which players
  they added, their tier, whether starred.

That split drives a UI invariant: API-sourced fields are **display-only**
everywhere. Only `tier` and `starred` are user-editable. Adding a player is
gated on `form.sleeperId`, which `pickMatch()` sets and any keystroke in the
name field clears — so a freehand name can never be saved. `sleeperId` is not
persisted; the `players` table has no column for it.

### Auth gate

`src/main.jsx` → `src/App.jsx` → `src/CheatSheet.jsx`.

`App.jsx` holds a **tri-state** session: `undefined` means still checking,
`null` means signed out, an object means signed in. The three states render
loading / sign-in / board respectively — collapsing `undefined` and `null`
would flash the sign-in screen on every reload. `CheatSheet` only ever mounts
with a real `userId`.

### Security model

Row-level security is the actual access control. The policy in
`sql/schema.sql` scopes every operation to `auth.uid() = user_id`. The
`.eq("user_id", userId)` filters in `CheatSheet.jsx` are a bandwidth
optimization, not a security boundary — do not treat adding or removing them
as a security change.

### Optimistic updates

`updatePlayer` and `deletePlayer` mutate local state first, then hit Supabase.
`updatePlayer` rolls back by refetching the user's rows on error; `deletePlayer`
does not. Preserve the refetch-on-error shape when touching these.

### Print output

The board is designed to be printed (`window.print()`). Tailwind `print:`
variants appear throughout `CheatSheet.jsx` — many elements render one way on
screen and another on paper. When editing a row, check both: a change that
looks right on screen can silently break the printed sheet.

## GitHub OAuth is a two-hop chain

Two separate settings in two different dashboards, easy to conflate:

| Setting | Value | Hop |
| --- | --- | --- |
| GitHub OAuth App → Authorization callback URL | `https://<project-ref>.supabase.co/auth/v1/callback` | GitHub → Supabase |
| Supabase → Auth → URL Configuration → Redirect URLs | `http://localhost:5173/**` (plus any deployed origin) | Supabase → app |

GitHub never calls the app directly. Pointing the OAuth App at `localhost`
produces `redirect_uri is not associated with this application`. To see what
Supabase actually sends:

```bash
curl -s -i "https://<project-ref>.supabase.co/auth/v1/authorize?provider=github" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" | grep -i '^location:'
```

## Conventions

`context/current-feature.md` tracks in-flight and upcoming work, with an
archive of what's already shipped. Keep it current when finishing or starting
a feature.

Known drift: the env var is named `VITE_SUPABASE_ANON_KEY` but holds a modern
`sb_publishable_...` key. Renaming it is a tracked task.
