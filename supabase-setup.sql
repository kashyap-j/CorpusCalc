-- CorpusCalc Supabase Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/oxjlzwvnhfopttcyeeao/sql)

-- ── MIGRATION (run if you already ran the old version) ────────────────────────
-- Rename plan_events → plan_analytics if it exists
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'plan_events'
  ) then
    alter table public.plan_events rename to plan_analytics;
  end if;
end $$;


-- ── Feedback table ────────────────────────────────────────────────────────────
create table if not exists public.feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text,
  email       text,
  message     text not null
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);

create policy "Service role can read feedback"
  on public.feedback
  for select
  to service_role
  using (true);


-- ── Plan analytics table ──────────────────────────────────────────────────────
create table if not exists public.plan_analytics (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete set null,
  event       text not null,        -- e.g. 'plan_started', 'step_completed', 'report_viewed'
  step        int,                   -- which step (1-7)
  tab         int,                   -- 1 = Solo/Spouse, 2 = With Kids
  meta        jsonb                  -- any extra data
);

alter table public.plan_analytics enable row level security;

create policy "Users can insert their own events"
  on public.plan_analytics
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Anon events allowed"
  on public.plan_analytics
  for insert
  to anon
  with check (user_id is null);


-- ── Visit counter table ───────────────────────────────────────────────────────
create table if not exists public.visit_counter (
  id    int primary key default 1,
  count bigint not null default 0,
  constraint visit_counter_single_row check (id = 1)
);

-- Seed the single row
insert into public.visit_counter (id, count)
values (1, 0)
on conflict (id) do nothing;

-- RLS: anyone can read, no direct writes (use RPC only)
alter table public.visit_counter enable row level security;

create policy "Anyone can read visit count"
  on public.visit_counter
  for select
  to anon, authenticated
  using (true);

-- RPC function: atomically increment and return new count
create or replace function public.increment_visit_counter()
returns bigint
language sql
security definer
as $$
  update public.visit_counter
  set count = count + 1
  where id = 1
  returning count;
$$;

-- Grant execute to all roles
grant execute on function public.increment_visit_counter() to anon, authenticated;


-- ── Saved plans table (optional — for future multi-plan support) ──────────────
create table if not exists public.saved_plans (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_name   text not null default 'My Plan',
  plan_data   jsonb not null
);

alter table public.saved_plans enable row level security;

create policy "Users can manage their own plans"
  on public.saved_plans
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
