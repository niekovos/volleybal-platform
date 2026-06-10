export type Dag = 'maandag' | 'dinsdag' | 'woensdag' | 'donderdag' | 'vrijdag'

export type Aanvoerder = {
  naam: string
  tel: string
  mail: string
}

export type Blokkade = {
  id: string
  van: string
  tot: string
  reden: string
}

export type Locatie = {
  id: string
  naam: string
  plaats: string
  adres: string
  velden: number
}

export type Team = {
  id: string
  naam: string
  kort: string
  plaats: string
  adres: string
  hue: number
  poule_id: string | null
  locatie_id: string
  avond: Dag
  start: string
  trainingsAvond: string | null
  trainingsTijd: string | null
  aanvoerder: Aanvoerder
  blokkades: Blokkade[]
}

export type GebruikerProfiel = {
  id: string
  naam: string
  rol: 'speler' | 'aanvoerder' | 'organisator'
  team_id: string | null
}

export type Poule = {
  id: string
  naam: string
  niveau: string
  competitie_id: string
  format: 'enkel' | 'anderhalf' | 'dubbel'
}

export type AanvoerderUitnodiging = {
  id: string
  team_id: string
  team_naam: string
  email: string
  type: 'uitnodiging' | 'overdracht'
  token: string
  van_id: string | null
  status: 'open' | 'geaccepteerd' | 'afgewezen'
  expires_at: string
}

export type CurrentProfile = {
  userId: string
  teamId: string | null
  rol: 'speler' | 'aanvoerder' | 'organisator'
  naam: string
}

export type Competitie = {
  id: string
  naam: string
  type: 'heren' | 'dames' | 'mix'
  format: 'enkel' | 'anderhalf' | 'dubbel'
  seizoen: string
  startDatum: string
  eindDatum: string
  poules?: string[]
}

export type WedstrijdStatus = 'gepland' | 'gespeeld' | 'verzoek'

export type Verplaatsverzoek = {
  door: string
  aan: string
  reden: string
  nieuweDatum: string
  nieuweTijd: string
}

export type Wedstrijd = {
  id: string
  poule_id: string
  thuis_id: string
  uit_id: string
  datum: string
  tijd: string
  locatie_id: string
  status: WedstrijdStatus
  uitslag: [number, number] | null
  verzoek?: Verplaatsverzoek
}

export type Stand = {
  team_id: string
  poule_id: string
  g: number
  w: number
  v: number
  sv: number
  st: number
  pnt: number
}

export type AppData = {
  locaties: Record<string, Locatie>
  teams: Record<string, Team>
  poules: Record<string, Poule>
  competities: Record<string, Competitie>
  standen: Record<string, Stand[]>
  wedstrijden: Wedstrijd[]
}

export type DemoRol = 'speler' | 'aanvoerder' | 'organisator'
