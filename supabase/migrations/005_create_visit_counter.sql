-- Creates a single-row visit counter table and an RPC to increment it atomically.

CREATE TABLE IF NOT EXISTS visit_counter (
  id    int  PRIMARY KEY DEFAULT 1,
  count bigint NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the single row if it doesn't exist
INSERT INTO visit_counter (id, count) VALUES (1, 0)
  ON CONFLICT (id) DO NOTHING;

-- RPC used by incrementVisitCounter() in src/lib/supabase.ts
CREATE OR REPLACE FUNCTION increment_visit_counter()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE visit_counter SET count = count + 1 WHERE id = 1;
$$;
