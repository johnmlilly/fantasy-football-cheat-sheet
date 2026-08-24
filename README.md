# Draft Cheat Sheet

Fantasy football draft board — search live NFL players, tag position/team/priority,
star sleepers, sort, print. Saved per-user via Supabase.

## Setup

1. **Create a Supabase project** at supabase.com (free tier is fine).
2. **Run the schema**: Supabase dashboard → SQL Editor → paste and run `sql/schema.sql`.
   This creates the `players` table and locks it down with row-level security so each
   user can only ever see/edit their own rows.
3. **Enable GitHub sign-in**: Supabase dashboard → Authentication → Providers → GitHub.
   You'll need a GitHub OAuth App (github.com → Settings → Developer settings → OAuth Apps)
   with its callback URL set to the one Supabase shows on that page. Paste the resulting
   Client ID/Secret back into Supabase.
4. **Set env vars**: copy `.env.example` to `.env` and fill in your project's URL and
   anon key (Supabase dashboard → Project Settings → API).
5. `npm install`
6. `npm run dev`

## Build

npm run build   # outputs to dist/

## Notes

- NFL player search pulls from Sleeper's free public API (api.sleeper.app) and caches
  the list in the browser for 24h — no key needed.
- `.env` is gitignored — don't commit it. When you deploy (Vercel/Netlify), add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in that
  platform's dashboard instead.
