# Volley Assen Platform

Recreatievolleybal-competitie platform voor Assen en omstreken.

## Snel starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Pagina's

| URL | Beschrijving |
|-----|-------------|
| `/standen` | Publiek standen overzicht (mobiel) |
| `/programma` | Publiek wedstrijdprogramma (mobiel) |
| `/mijn-team` | Favoriet team volgen (mobiel) |
| `/aanvoerder` | Captain dashboard (mobiel) |
| `/organisator` | Admin paneel (desktop) |
| `/login` | Inlogpagina met demo-knoppen |

## Tech-stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** (CSS-first configuratie)
- **Supabase** (PostgreSQL + Auth) — optioneel, werkt ook met mock-data

## Demo-modus

De app werkt direct uit de doos met mock-data — geen database nodig.  
Gebruik de demo-knoppen op `/login` om als aanvoerder of organisator te testen.

## Supabase koppelen

1. Maak een project op [supabase.com](https://supabase.com)
2. Kopieer `.env.local.example` naar `.env.local` en vul de credentials in
3. Voer `supabase/schema.sql` uit in de Supabase SQL Editor
4. Voer `supabase/seed.sql` uit voor voorbeelddata

## Drie rollen

### Speler (publiek)
- Standen en programma bekijken zonder account
- Favoriet team kiezen (opgeslagen in localStorage)
- Wedstrijd- en team-details bekijken

### Aanvoerder (ingelogd, mobiel)
- Uitslagen doorgeven
- Wedstrijden verplaatsen (verzoek naar tegenstander)
- Inkomende verplaatsverzoeken goedkeuren/afwijzen
- Beschikbaarheid en blokkeerperiodes beheren
- Teamgegevens bijwerken

### Organisator (ingelogd, desktop)
- Competities, poules en teams aanmaken/bewerken
- Locaties beheren (CRUD)
- Standen handmatig corrigeren
- Volledig programmaoverzicht

## Design tokens

Zie `app/globals.css` voor alle CSS-variabelen. Kleuren zijn gebaseerd op oklch.  
Donkere modus volgt automatisch de systeemvoorkeur.
