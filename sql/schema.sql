create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz not null default now(),
  name text not null,
  position text not null,
  team text not null,
  tier int not null default 3,
  starred boolean not null default false
);

alter table players enable row level security;

create policy "Users manage their own players"
  on players for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
