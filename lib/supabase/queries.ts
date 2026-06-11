import type { AppData, CurrentProfile, Dag, UitslagVerzoek, WedstrijdStatus } from '../types'
import { createClient } from './client'

function tid(s: string): string {
  return s ? s.slice(0, 5) : s
}

export async function fetchCurrentProfile(): Promise<CurrentProfile | null> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: p } = await sb
    .from('gebruiker_profielen')
    .select('rol, team_id, naam')
    .eq('id', user.id)
    .single()
  if (!p) return null
  return {
    userId: user.id,
    teamId: p.team_id ?? null,
    rol: p.rol as CurrentProfile['rol'],
    naam: p.naam,
  }
}

export async function fetchAppData(): Promise<AppData> {
  const sb = createClient()

  const [
    { data: locRows },
    { data: compRows },
    { data: pouleRows },
    { data: teamRows },
    { data: blokRows },
    { data: wedRows },
    { data: vrzRows },
    { data: standRows },
    { data: uvRows },
  ] = await Promise.all([
    sb.from('locaties').select('*'),
    sb.from('competities').select('*'),
    sb.from('poules').select('*'),
    sb.from('teams').select('*'),
    sb.from('blokkades').select('*'),
    sb.from('wedstrijden').select('*').order('datum').order('tijd'),
    sb.from('verplaatsverzoeken').select('*').eq('status', 'open'),
    sb.from('standen_berekend').select('*'),
    sb.from('uitslag_verzoeken').select('*').in('status', ['open', 'geescaleerd']),
  ])

  const locaties: AppData['locaties'] = {}
  for (const r of locRows ?? []) {
    locaties[r.id] = { id: r.id, naam: r.naam, plaats: r.plaats, adres: r.adres, velden: r.velden }
  }

  const competities: AppData['competities'] = {}
  for (const r of compRows ?? []) {
    competities[r.id] = {
      id: r.id,
      naam: r.naam,
      type: r.type as 'heren' | 'dames' | 'mix',
      format: r.format as 'enkel' | 'anderhalf' | 'dubbel',
      seizoen: r.seizoen,
      startDatum: r.start_datum,
      eindDatum: r.eind_datum,
    }
  }

  const poules: AppData['poules'] = {}
  for (const r of pouleRows ?? []) {
    poules[r.id] = {
      id: r.id,
      naam: r.naam,
      niveau: r.niveau,
      competitie_id: r.competitie_id,
      format: (r.format ?? 'enkel') as 'enkel' | 'anderhalf' | 'dubbel',
      maxSets: r.max_sets ?? 4,
    }
  }

  const blokByTeam: Record<string, { id: string; van: string; tot: string; reden: string }[]> = {}
  for (const b of blokRows ?? []) {
    ;(blokByTeam[b.team_id] ??= []).push({ id: b.id, van: b.van, tot: b.tot, reden: b.reden })
  }

  const teams: AppData['teams'] = {}
  for (const r of teamRows ?? []) {
    teams[r.id] = {
      id: r.id,
      naam: r.naam,
      kort: r.kort,
      plaats: r.plaats,
      adres: r.adres,
      hue: r.hue,
      poule_id: r.poule_id ?? null,
      locatie_id: r.locatie_id,
      avond: r.avond as Dag,
      start: tid(r.start_tijd),
      speelavonden: Array.isArray(r.speelavonden) ? r.speelavonden : [],
      aanvoerder: { naam: r.aanvoerder_naam, tel: r.aanvoerder_tel, mail: r.aanvoerder_mail },
      blokkades: blokByTeam[r.id] ?? [],
    }
  }

  const vrzByWedstrijd: Record<string, { id: string; door_team_id: string; aan_team_id: string; reden: string; nieuwe_datum: string; nieuwe_tijd: string }> = {}
  for (const v of vrzRows ?? []) {
    vrzByWedstrijd[v.wedstrijd_id] = { id: v.id, door_team_id: v.door_team_id, aan_team_id: v.aan_team_id, reden: v.reden, nieuwe_datum: v.nieuwe_datum, nieuwe_tijd: v.nieuwe_tijd }
  }

  const wedstrijden = (wedRows ?? []).map(r => {
    const v = vrzByWedstrijd[r.id]
    return {
      id: r.id,
      poule_id: r.poule_id,
      thuis_id: r.thuis_id,
      uit_id: r.uit_id,
      datum: r.datum,
      tijd: tid(r.tijd),
      locatie_id: r.locatie_id,
      status: r.status as WedstrijdStatus,
      uitslag:
        r.uitslag_thuis != null && r.uitslag_uit != null
          ? ([r.uitslag_thuis, r.uitslag_uit] as [number, number])
          : null,
      verzoek: v
        ? {
            id: v.id,
            door: v.door_team_id,
            aan: v.aan_team_id,
            reden: v.reden,
            nieuweDatum: v.nieuwe_datum,
            nieuweTijd: tid(v.nieuwe_tijd),
          }
        : undefined,
    }
  })

  const standen: AppData['standen'] = {}
  for (const r of standRows ?? []) {
    ;(standen[r.poule_id] ??= []).push({
      team_id: r.team_id,
      poule_id: r.poule_id,
      g: r.g,
      w: r.w,
      v: r.v,
      sv: r.sv,
      st: r.st,
      pnt: r.pnt,
    })
  }
  for (const key of Object.keys(standen)) {
    standen[key].sort((a, b) => b.pnt - a.pnt || (b.sv - b.st) - (a.sv - a.st))
  }

  const uitslag_verzoeken: UitslagVerzoek[] = (uvRows ?? []).map(r => ({
    id: r.id,
    wedstrijd_id: r.wedstrijd_id,
    ingediend_door: r.ingediend_door,
    te_bevestigen_door: r.te_bevestigen_door,
    uitslag_thuis: r.uitslag_thuis,
    uitslag_uit: r.uitslag_uit,
    status: r.status,
    created_at: r.created_at,
  }))

  return { locaties, competities, poules, teams, wedstrijden, standen, uitslag_verzoeken }
}
