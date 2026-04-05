-- Migration: 004_plan_versions.sql
-- Creates the plan_versions table to store versioned snapshots of saved plans,
-- with RLS policies and indexes. Does not modify any existing tables.

CREATE TABLE IF NOT EXISTS plan_versions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name      text        NOT NULL,
  plan_data      jsonb       NOT NULL,
  version_number int         NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plan_versions_user_id_plan_name_version_key
    UNIQUE (user_id, plan_name, version_number)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE plan_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_versions: select own rows"
  ON plan_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "plan_versions: insert own rows"
  ON plan_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plan_versions: update own rows"
  ON plan_versions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plan_versions: delete own rows"
  ON plan_versions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS plan_versions_user_id_idx
  ON plan_versions (user_id);

CREATE INDEX IF NOT EXISTS plan_versions_created_at_idx
  ON plan_versions (created_at DESC);
