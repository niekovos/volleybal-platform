-- Migration 007: configurable number of sets per poule
ALTER TABLE poules ADD COLUMN IF NOT EXISTS max_sets integer NOT NULL DEFAULT 4
  CHECK (max_sets IN (3, 4, 5));
