-- Migration: 002_enable_rls.sql
-- Enables Row Level Security on all user-owned tables and creates
-- per-operation policies so users can only access their own rows.
-- NOTE: user_plans already has RLS enabled in 001_create_user_plans.sql.

-- ─── users ────────────────────────────────────────────────────────────────────
-- Uses auth.uid() = id because the primary key IS the auth user id.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own row"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: insert own row"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: update own row"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: delete own row"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- ─── retirement_plans ─────────────────────────────────────────────────────────

ALTER TABLE retirement_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retirement_plans: select own rows"
  ON retirement_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "retirement_plans: insert own rows"
  ON retirement_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retirement_plans: update own rows"
  ON retirement_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retirement_plans: delete own rows"
  ON retirement_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ─── plan_inputs ──────────────────────────────────────────────────────────────

ALTER TABLE plan_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_inputs: select own rows"
  ON plan_inputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "plan_inputs: insert own rows"
  ON plan_inputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plan_inputs: update own rows"
  ON plan_inputs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plan_inputs: delete own rows"
  ON plan_inputs FOR DELETE
  USING (auth.uid() = user_id);

-- ─── assets ───────────────────────────────────────────────────────────────────

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets: select own rows"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "assets: insert own rows"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assets: update own rows"
  ON assets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assets: delete own rows"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- ─── sip_entries ──────────────────────────────────────────────────────────────

ALTER TABLE sip_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sip_entries: select own rows"
  ON sip_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sip_entries: insert own rows"
  ON sip_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sip_entries: update own rows"
  ON sip_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sip_entries: delete own rows"
  ON sip_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ─── calculator_sessions ──────────────────────────────────────────────────────

ALTER TABLE calculator_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calculator_sessions: select own rows"
  ON calculator_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "calculator_sessions: insert own rows"
  ON calculator_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calculator_sessions: update own rows"
  ON calculator_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calculator_sessions: delete own rows"
  ON calculator_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── article_reads ────────────────────────────────────────────────────────────

ALTER TABLE article_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_reads: select own rows"
  ON article_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "article_reads: insert own rows"
  ON article_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "article_reads: update own rows"
  ON article_reads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "article_reads: delete own rows"
  ON article_reads FOR DELETE
  USING (auth.uid() = user_id);

-- ─── user_preferences ─────────────────────────────────────────────────────────

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences: select own rows"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences: insert own rows"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences: update own rows"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences: delete own rows"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);
