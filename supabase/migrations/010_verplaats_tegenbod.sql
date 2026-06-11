-- Migration 010: reschedule back-and-forth (counter-proposals)
-- Adds parent_id to chain counter-proposals and a 'beantwoord' status
-- to mark superseded proposals.

ALTER TABLE verplaatsverzoeken
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES verplaatsverzoeken(id);

-- Replace status check constraint to include 'beantwoord'
DO $$ BEGIN
  ALTER TABLE verplaatsverzoeken DROP CONSTRAINT verplaatsverzoeken_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE verplaatsverzoeken
  ADD CONSTRAINT verplaatsverzoeken_status_check
  CHECK (status IN ('open', 'goedgekeurd', 'afgewezen', 'beantwoord'));
