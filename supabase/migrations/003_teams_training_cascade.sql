-- ─────────────────────────────────────────────────────────────
-- Migration 003: Teams without poule, training schedule, cascade
-- ─────────────────────────────────────────────────────────────

-- Make teams.poule_id optional (teams can exist without a poule)
ALTER TABLE teams ALTER COLUMN poule_id DROP NOT NULL;
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_poule_id_fkey;
ALTER TABLE teams ADD CONSTRAINT teams_poule_id_fkey
  FOREIGN KEY (poule_id) REFERENCES poules(id) ON DELETE SET NULL;

-- Training schedule fields
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS trainings_avond text
    CHECK (trainings_avond IS NULL OR trainings_avond IN
      ('maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag')),
  ADD COLUMN IF NOT EXISTS trainings_tijd time;

-- Cascade wedstrijden when a poule is deleted
ALTER TABLE wedstrijden DROP CONSTRAINT IF EXISTS wedstrijden_poule_id_fkey;
ALTER TABLE wedstrijden ADD CONSTRAINT wedstrijden_poule_id_fkey
  FOREIGN KEY (poule_id) REFERENCES poules(id) ON DELETE CASCADE;

-- Allow organizers to read all user profiles
DROP POLICY IF EXISTS "Organisator ziet profielen" ON gebruiker_profielen;
CREATE POLICY "Organisator ziet profielen" ON gebruiker_profielen FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM gebruiker_profielen gp
      WHERE gp.id = auth.uid() AND gp.rol = 'organisator'
    )
  );

-- Allow organizers to update any user profile (e.g. change role or team)
DROP POLICY IF EXISTS "Organisator bewerkt profielen" ON gebruiker_profielen;
CREATE POLICY "Organisator bewerkt profielen" ON gebruiker_profielen FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gebruiker_profielen gp
      WHERE gp.id = auth.uid() AND gp.rol = 'organisator'
    )
  );
