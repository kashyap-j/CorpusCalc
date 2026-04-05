-- Migration: 002_enable_rls.sql
-- Enables Row Level Security on all user-facing tables and creates
-- appropriate policies based on each table's access pattern.

-- ─── saved_plans ──────────────────────────────────────────────────────────────
-- Full CRUD: users can only access their own saved plans.

ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_plans: select own rows"
  ON saved_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_plans: insert own rows"
  ON saved_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_plans: update own rows"
  ON saved_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_plans: delete own rows"
  ON saved_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ─── user_plans ───────────────────────────────────────────────────────────────
-- Full CRUD: users can only access their own plan row.
-- NOTE: 001_create_user_plans.sql already enables RLS and adds SELECT/INSERT/UPDATE
-- policies. The DELETE policy and any missing policies are added here defensively
-- using CREATE POLICY IF NOT EXISTS (Postgres 15+ / Supabase).

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own plan"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own plan"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own plan"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "user_plans: delete own row"
  ON user_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ─── plan_events ──────────────────────────────────────────────────────────────
-- SELECT + INSERT only: users can read and record their own events.
-- No UPDATE or DELETE to preserve the integrity of the event log.

ALTER TABLE plan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_events: select own rows"
  ON plan_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "plan_events: insert own rows"
  ON plan_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── feedback ─────────────────────────────────────────────────────────────────
-- Public INSERT: anyone (including unauthenticated users) can submit feedback.
-- No SELECT/UPDATE/DELETE exposed to clients.

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback: public insert"
  ON feedback FOR INSERT
  WITH CHECK (true);
