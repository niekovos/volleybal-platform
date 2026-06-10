-- ─────────────────────────────────────────────────────────────
-- Migration 005: Speelavonden repeater, remove training fields
-- ─────────────────────────────────────────────────────────────

-- Add speelavonden JSONB array (list of {dag, tijd} objects)
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS speelavonden jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing single avond + start_tijd into the new array
UPDATE teams
SET speelavonden = jsonb_build_array(
  jsonb_build_object(
    'dag',  avond,
    'tijd', COALESCE(SUBSTRING(start_tijd::text, 1, 5), '20:00')
  )
)
WHERE avond IS NOT NULL
  AND speelavonden = '[]'::jsonb;

-- Remove training columns added in migration 003
ALTER TABLE teams DROP COLUMN IF EXISTS trainings_avond;
ALTER TABLE teams DROP COLUMN IF EXISTS trainings_tijd;
