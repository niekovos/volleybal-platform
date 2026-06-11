-- Grant read access on standen_berekend view to PostgREST roles.
-- Views don't inherit RLS from underlying tables, so explicit grants are needed.
grant select on standen_berekend to anon, authenticated;
