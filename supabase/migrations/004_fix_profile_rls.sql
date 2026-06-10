-- ─────────────────────────────────────────────────────────────
-- Migration 004: Simplify gebruiker_profielen RLS
-- ─────────────────────────────────────────────────────────────
-- The FOR ALL + FOR SELECT combination from migration 003 can
-- cause RLS to block SELECT for authenticated users in some
-- Supabase configurations. Replace with explicit per-command
-- policies that are unambiguous.

-- Drop all existing policies on this table
DROP POLICY IF EXISTS "Eigen profiel"                ON gebruiker_profielen;
DROP POLICY IF EXISTS "Organisator ziet profielen"   ON gebruiker_profielen;
DROP POLICY IF EXISTS "Organisator bewerkt profielen" ON gebruiker_profielen;

-- Any authenticated user can read all profiles (names, roles, team assignment)
CREATE POLICY "Authenticated ziet profielen" ON gebruiker_profielen
  FOR SELECT TO authenticated
  USING (true);

-- A user can only insert their own profile row
CREATE POLICY "Eigen profiel aanmaken" ON gebruiker_profielen
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- A user can update their own profile; organizers can update any profile
CREATE POLICY "Profiel bijwerken" ON gebruiker_profielen
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM gebruiker_profielen gp
      WHERE gp.id = auth.uid() AND gp.rol = 'organisator'
    )
  );
