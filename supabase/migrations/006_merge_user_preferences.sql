-- Migration: 006_merge_user_preferences.sql
-- Adds preference columns directly to the users table so that user preferences
-- can be fetched in a single row lookup without joining user_preferences.
-- user_preferences is intentionally left in place for safety.
-- Does not modify any application code or logic.

-- ADD COLUMN IF NOT EXISTS requires Postgres 9.6+; Supabase runs Postgres 15.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS theme              text    NOT NULL DEFAULT 'light';
