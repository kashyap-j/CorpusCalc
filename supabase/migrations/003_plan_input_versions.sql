-- Migration: 003_plan_input_versions.sql
-- Creates the plan_input_versions table to store versioned snapshots of
-- retirement plan inputs. Does not modify any existing tables.

CREATE TABLE IF NOT EXISTS plan_input_versions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id        uuid        NOT NULL REFERENCES retirement_plans(id) ON DELETE CASCADE,
  version_number int         NOT NULL,
  inputs         jsonb       NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plan_input_versions_plan_id_version_number_key
    UNIQUE (plan_id, version_number)
);

CREATE INDEX IF NOT EXISTS plan_input_versions_plan_id_idx
  ON plan_input_versions (plan_id);
