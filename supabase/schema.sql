-- ─────────────────────────────────────────────────────────────
-- Volleybal Platform — Supabase PostgreSQL schema
-- Voer dit uit in de Supabase SQL Editor (of via supabase db push)
-- ─────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Locaties ──
create table locaties (
  id          text primary key,
  naam        text not null,
  plaats      text not null,
  adres       text not null default '',
  velden      int  not null default 2,
  created_at  timestamptz default now()
);

-- ── Competities ──
create table competities (
  id          text primary key,
  naam        text not null,
  type        text not null check (type in ('heren','dames','mix')),
  format      text not null check (format in ('enkel','anderhalf','dubbel')),
  seizoen     text not null,
  start_datum date not null,
  eind_datum  date not null,
  created_at  timestamptz default now()
);

-- ── Poules ──
create table poules (
  id              text primary key,
  naam            text not null,
  niveau          text not null default '',
  competitie_id   text not null references competities(id) on delete cascade,
  created_at      timestamptz default now()
);

-- ── Teams ──
create table teams (
  id              text primary key,
  naam            text not null,
  kort            char(3) not null,
  plaats          text not null default '',
  adres           text not null default '',
  hue             int  not null default 200 check (hue >= 0 and hue < 360),
  poule_id        text not null references poules(id),
  locatie_id      text not null references locaties(id),
  avond           text not null check (avond in ('maandag','dinsdag','woensdag','donderdag','vrijdag')),
  start_tijd      time not null default '20:00',
  aanvoerder_naam text not null default '',
  aanvoerder_tel  text not null default '',
  aanvoerder_mail text not null default '',
  created_at      timestamptz default now()
);

-- ── Blokkeerperiodes ──
create table blokkades (
  id        uuid primary key default uuid_generate_v4(),
  team_id   text not null references teams(id) on delete cascade,
  van       date not null,
  tot       date not null,
  reden     text not null default '',
  created_at timestamptz default now()
);

-- ── Wedstrijden ──
create table wedstrijden (
  id          text primary key,
  poule_id    text not null references poules(id),
  thuis_id    text not null references teams(id),
  uit_id      text not null references teams(id),
  datum       date not null,
  tijd        time not null default '20:00',
  locatie_id  text not null references locaties(id),
  status      text not null default 'gepland' check (status in ('gepland','gespeeld','verzoek')),
  uitslag_thuis int,
  uitslag_uit   int,
  created_at  timestamptz default now(),
  check (thuis_id != uit_id)
);

-- ── Verplaatsverzoeken ──
create table verplaatsverzoeken (
  id              uuid primary key default uuid_generate_v4(),
  wedstrijd_id    text not null references wedstrijden(id) on delete cascade,
  door_team_id    text not null references teams(id),
  aan_team_id     text not null references teams(id),
  reden           text not null,
  nieuwe_datum    date not null,
  nieuwe_tijd     time not null,
  status          text not null default 'open' check (status in ('open','goedgekeurd','afgewezen')),
  created_at      timestamptz default now()
);

-- ── Standen (berekend + handmatig corrigeerbaar) ──
create table standen (
  team_id   text not null references teams(id) on delete cascade,
  poule_id  text not null references poules(id) on delete cascade,
  g         int not null default 0,
  w         int not null default 0,
  v         int not null default 0,
  sv        int not null default 0,
  st        int not null default 0,
  pnt       int not null default 0,
  primary key (team_id, poule_id)
);

-- ── Gebruikers (speler-accounts) ──
-- Koppelt Supabase auth.users aan teams
create table gebruiker_profielen (
  id        uuid primary key references auth.users(id) on delete cascade,
  naam      text not null,
  rol       text not null default 'speler' check (rol in ('speler','aanvoerder','organisator')),
  team_id   text references teams(id),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- Views
-- ─────────────────────────────────────────────────────────────

-- Stand berekend uit uitslagen
create or replace view standen_berekend as
select
  t.id as team_id,
  t.poule_id,
  count(w.id)::int                                                  as g,
  sum(case when (w.thuis_id = t.id and w.uitslag_thuis > w.uitslag_uit)
             or  (w.uit_id   = t.id and w.uitslag_uit > w.uitslag_thuis) then 1 else 0 end)::int as w,
  sum(case when (w.thuis_id = t.id and w.uitslag_thuis < w.uitslag_uit)
             or  (w.uit_id   = t.id and w.uitslag_uit < w.uitslag_thuis) then 1 else 0 end)::int as v,
  sum(case when w.thuis_id = t.id then w.uitslag_thuis
            when w.uit_id   = t.id then w.uitslag_uit else 0 end)::int as sv,
  sum(case when w.thuis_id = t.id then w.uitslag_uit
            when w.uit_id   = t.id then w.uitslag_thuis else 0 end)::int as st,
  sum(case when w.thuis_id = t.id then w.uitslag_thuis
            when w.uit_id   = t.id then w.uitslag_uit else 0 end)::int as pnt
from teams t
left join wedstrijden w on (w.thuis_id = t.id or w.uit_id = t.id) and w.status = 'gespeeld' and w.uitslag_thuis is not null
group by t.id, t.poule_id;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

alter table locaties enable row level security;
alter table competities enable row level security;
alter table poules enable row level security;
alter table teams enable row level security;
alter table blokkades enable row level security;
alter table wedstrijden enable row level security;
alter table verplaatsverzoeken enable row level security;
alter table standen enable row level security;
alter table gebruiker_profielen enable row level security;

-- Publiek lezen voor standen/programma
create policy "Publiek leesbaar" on locaties     for select using (true);
create policy "Publiek leesbaar" on competities  for select using (true);
create policy "Publiek leesbaar" on poules       for select using (true);
create policy "Publiek leesbaar" on teams        for select using (true);
create policy "Publiek leesbaar" on wedstrijden  for select using (true);
create policy "Publiek leesbaar" on standen      for select using (true);

-- Aanvoerder: eigen team wijzigen
create policy "Aanvoerder eigen team" on teams for update
  using (
    id = (select team_id from gebruiker_profielen where id = auth.uid())
  );

create policy "Aanvoerder eigen blokkades" on blokkades for all
  using (
    team_id = (select team_id from gebruiker_profielen where id = auth.uid())
  );

-- Aanvoerder: verplaatsverzoeken van/aan eigen team
create policy "Aanvoerder verzoeken" on verplaatsverzoeken for all
  using (
    door_team_id = (select team_id from gebruiker_profielen where id = auth.uid())
    or aan_team_id = (select team_id from gebruiker_profielen where id = auth.uid())
  );

-- Aanvoerder: uitslag doorgeven voor eigen wedstrijden
create policy "Aanvoerder uitslagen" on wedstrijden for update
  using (
    thuis_id = (select team_id from gebruiker_profielen where id = auth.uid())
    or uit_id = (select team_id from gebruiker_profielen where id = auth.uid())
  );

-- Organisator: volledige schrijftoegang
create policy "Organisator volledig" on locaties     for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));
create policy "Organisator volledig" on competities  for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));
create policy "Organisator volledig" on poules       for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));
create policy "Organisator volledig" on teams        for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));
create policy "Organisator volledig" on wedstrijden  for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));
create policy "Organisator volledig" on standen      for all using (exists (select 1 from gebruiker_profielen where id = auth.uid() and rol = 'organisator'));

-- Eigen profiel inzien
create policy "Eigen profiel" on gebruiker_profielen for all using (id = auth.uid());
