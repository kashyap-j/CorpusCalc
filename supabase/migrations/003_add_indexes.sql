-- Migration: 003_add_indexes.sql
-- Adds indexes on frequently queried columns across user-facing tables.
-- Does not modify any table structure.

-- ─── saved_plans ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS saved_plans_user_id_idx
  ON saved_plans (user_id);

CREATE INDEX IF NOT EXISTS saved_plans_updated_at_idx
  ON saved_plans (updated_at DESC);

-- ─── user_plans ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS user_plans_user_id_idx
  ON user_plans (user_id);

CREATE INDEX IF NOT EXISTS user_plans_updated_at_idx
  ON user_plans (updated_at DESC);

-- ─── plan_events ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS plan_events_user_id_idx
  ON plan_events (user_id);

CREATE INDEX IF NOT EXISTS plan_events_created_at_idx
  ON plan_events (created_at DESC);
