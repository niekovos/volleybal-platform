-- Migration 009: score verification between captains
-- When a captain submits a score, the opposing captain must confirm it.

CREATE TABLE uitslag_verzoeken (
  id                  uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedstrijd_id        text    NOT NULL REFERENCES wedstrijden(id) ON DELETE CASCADE,
  ingediend_door      text    NOT NULL REFERENCES teams(id),
  te_bevestigen_door  text    NOT NULL REFERENCES teams(id),
  uitslag_thuis       int     NOT NULL,
  uitslag_uit         int     NOT NULL,
  status              text    NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'goedgekeurd', 'gecorrigeerd', 'geescaleerd')),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE uitslag_verzoeken ENABLE ROW LEVEL SECURITY;

-- Everyone can read (needed for dashboard)
CREATE POLICY "Publiek leesbaar" ON uitslag_verzoeken
  FOR SELECT USING (true);

-- Captains can insert/update for their own matches
CREATE POLICY "Aanvoerder eigen uitslag verzoeken" ON uitslag_verzoeken
  FOR ALL USING (
    ingediend_door     = (SELECT team_id FROM gebruiker_profielen WHERE id = auth.uid())
    OR te_bevestigen_door = (SELECT team_id FROM gebruiker_profielen WHERE id = auth.uid())
  );

-- Organisators have full access
CREATE POLICY "Organisator volledig" ON uitslag_verzoeken
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gebruiker_profielen WHERE id = auth.uid() AND rol = 'organisator')
  );
