-- Migration: 005_calculator_sessions_index.sql
-- Adds lookup indexes to calculator_sessions.
-- Does not modify any table structure or application code.

-- Support fast filtering by user and calculator type together
-- (e.g. fetch all SIP sessions for a given user).
CREATE INDEX IF NOT EXISTS calculator_sessions_user_id_calculator_type_idx
  ON calculator_sessions (user_id, calculator_type);

-- Support fast retrieval of the most recent sessions across all users.
CREATE INDEX IF NOT EXISTS calculator_sessions_created_at_desc_idx
  ON calculator_sessions (created_at DESC);
