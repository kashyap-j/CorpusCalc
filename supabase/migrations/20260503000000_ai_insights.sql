-- Rate limiting + response cache
CREATE TABLE IF NOT EXISTS ai_insights_usage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at     timestamptz NOT NULL DEFAULT now(),
  plan_hash   text NOT NULL,
  response    text
);
CREATE INDEX IF NOT EXISTS ai_insights_usage_user_time ON ai_insights_usage(user_id, used_at);

-- Debug logging
CREATE TABLE IF NOT EXISTS ai_insights_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  duration_ms int,
  token_count int,
  error       text,
  cached      boolean DEFAULT false
);

-- RIA waitlist
CREATE TABLE IF NOT EXISTS ria_waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  mobile      text NOT NULL,
  risk_score  int,
  ytr         int,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE ai_insights_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ria_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rows only" ON ai_insights_usage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows only" ON ai_insights_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows only" ON ria_waitlist FOR ALL USING (auth.uid() = user_id);
