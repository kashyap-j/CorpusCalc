-- Migration: 004_article_reads_dedup.sql
-- Adds deduplication and lookup indexes to article_reads.
-- Does not modify any table structure or application code.

-- Prevent duplicate read events for the same user, article, and calendar day.
CREATE UNIQUE INDEX IF NOT EXISTS article_reads_user_slug_day_uidx
  ON article_reads (user_id, article_slug, DATE(read_at));

-- Support fast lookups by article slug (e.g. read counts per article).
CREATE INDEX IF NOT EXISTS article_reads_article_slug_idx
  ON article_reads (article_slug);

-- Support fast lookups by user (e.g. reading history per user).
CREATE INDEX IF NOT EXISTS article_reads_user_id_idx
  ON article_reads (user_id);
