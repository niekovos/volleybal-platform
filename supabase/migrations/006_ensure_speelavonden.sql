-- Migration 006: ensure speelavonden column exists (safe re-apply of 005)
-- Run this if migration 005 was not yet applied to the live database.

ALTER TABLE teams ADD COLUMN IF NOT EXISTS speelavonden jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing avond + start_tijd into speelavonden for rows that are still empty
UPDATE teams
SET speelavonden = jsonb_build_array(
  jsonb_build_object(
    'dag',  avond,
    'tijd', COALESCE(SUBSTRING(start_tijd::text, 1, 5), '20:00')
  )
)
WHERE avond IS NOT NULL
  AND speelavonden = '[]'::jsonb;
