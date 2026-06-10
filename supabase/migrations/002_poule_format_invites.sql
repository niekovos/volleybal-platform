-- Migration 002: format per poule + aanvoerder uitnodigingen
-- Voer dit uit in de Supabase SQL Editor

-- 1. Format verplaatsen van competities naar poules
alter table poules
  add column if not exists format text not null default 'enkel'
    check (format in ('enkel','anderhalf','dubbel'));

-- 2. Aanvoerder uitnodigingen & overdrachten
create table if not exists aanvoerder_uitnodigingen (
  id         uuid primary key default uuid_generate_v4(),
  team_id    text not null references teams(id) on delete cascade,
  email      text not null,
  type       text not null default 'uitnodiging'
               check (type in ('uitnodiging', 'overdracht')),
  token      text not null unique default encode(gen_random_bytes(32), 'hex'),
  van_id     uuid references auth.users(id),
  status     text not null default 'open'
               check (status in ('open', 'geaccepteerd', 'afgewezen')),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table aanvoerder_uitnodigingen enable row level security;

-- Iedereen kan lezen (token is voldoende beveiliging — 64 hex tekens)
create policy "Publiek leesbaar"
  on aanvoerder_uitnodigingen for select using (true);

-- Organisator mag alles
create policy "Organisator volledig"
  on aanvoerder_uitnodigingen for all
  using (exists (
    select 1 from gebruiker_profielen
    where id = auth.uid() and rol = 'organisator'
  ));

-- Aanvoerder mag overdracht aanmaken voor eigen team
create policy "Aanvoerder overdracht aanmaken"
  on aanvoerder_uitnodigingen for insert
  with check (
    type = 'overdracht'
    and team_id = (select team_id from gebruiker_profielen where id = auth.uid())
  );

-- Iedereen (incl. nieuw ingelogde gebruiker) mag status bijwerken
create policy "Status bijwerken"
  on aanvoerder_uitnodigingen for update using (true);

-- 3. Organisator moet ook gebruiker_profielen van anderen kunnen aanpassen
--    (nodig bij overdracht accepteren via service-role API route)
-- Geen extra policy nodig — de API-route gebruikt de service role.
