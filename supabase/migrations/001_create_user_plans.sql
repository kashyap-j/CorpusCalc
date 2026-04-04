-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS user_plans (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  inputs        jsonb       NOT NULL,
  corpus_result numeric     NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security — users can only access their own row
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own plan"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);
