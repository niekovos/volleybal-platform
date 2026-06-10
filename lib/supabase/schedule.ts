import type { Competitie, Team } from '../types'
import { createClient } from './client'

const DAG_NR: Record<string, number> = {
  maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5,
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime())
  d.setDate(d.getDate() + days)
  return d
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// First occurrence of `weekdayNr` on or after `from`
function firstWeekday(from: Date, weekdayNr: number): Date {
  const d = new Date(from.getTime())
  const diff = (weekdayNr - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff)
  return d
}

function isBlocked(
  iso: string,
  teamId: string,
  blokkades: Array<{ team_id: string; van: string; tot: string }>,
): boolean {
  return blokkades.some(b => b.team_id === teamId && b.van <= iso && iso <= b.tot)
}

// Circle method — generates all (thuis, uit) pairs for one round-robin
function buildFixtures(teamIds: string[]): Array<[string, string]> {
  const ids = [...teamIds]
  if (ids.length % 2 === 1) ids.push('__bye__')
  const n = ids.length
  const fixtures: Array<[string, string]> = []

  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const a = ids[i]
      const b = ids[n - 1 - i]
      if (a === '__bye__' || b === '__bye__') continue
      // Alternate home for the fixed team (i=0) each round to balance home/away
      fixtures.push(i === 0 && round % 2 === 1 ? [b, a] : [a, b])
    }
    // Rotate: keep ids[0] fixed, move last element to position 1
    const last = ids.pop()!
    ids.splice(1, 0, last)
  }

  return fixtures
}

export async function generateSchema(
  pouleId: string,
  teams: Team[],
  competitie: Competitie,
): Promise<number> {
  if (teams.length < 2) return 0

  const sb = createClient()

  const { data: blokRows } = await sb
    .from('blokkades')
    .select('team_id, van, tot')
    .in('team_id', teams.map(t => t.id))

  const blokkades = (blokRows ?? []) as Array<{ team_id: string; van: string; tot: string }>

  // Build fixture list
  let fixtures = buildFixtures(teams.map(t => t.id))

  if (competitie.format === 'dubbel') {
    // Each pair plays twice: home and away
    fixtures = [...fixtures, ...fixtures.map(([h, a]) => [a, h] as [string, string])]
  }
  // 'anderhalf' and 'enkel' both use the single round-robin

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]))
  const startDate = new Date(competitie.startDatum)
  const endDate = new Date(competitie.eindDatum)

  // Initialise last-played 7 days before the start so the first match lands on week 1
  const lastPlayed: Record<string, Date> = {}
  for (const t of teams) lastPlayed[t.id] = addDays(startDate, -7)

  const rows: Array<{
    id: string
    poule_id: string
    thuis_id: string
    uit_id: string
    datum: string
    tijd: string
    locatie_id: string
    status: string
  }> = []

  const ts = Date.now()

  for (let i = 0; i < fixtures.length; i++) {
    const [thuisId, uitId] = fixtures[i]
    const thuis = teamMap[thuisId]
    const weekdayNr = DAG_NR[thuis.avond] ?? 1

    // Earliest date: 7 days after the most recent match of either team
    const minDate = addDays(
      new Date(Math.max(lastPlayed[thuisId].getTime(), lastPlayed[uitId].getTime())),
      7,
    )
    if (minDate < startDate) minDate.setTime(startDate.getTime())

    let candidate = firstWeekday(minDate, weekdayNr)

    // Advance week by week until neither team is blocked (max 52 attempts = 1 year)
    for (let tries = 0; tries < 52; tries++) {
      if (candidate > endDate) break
      const iso = toIso(candidate)
      if (!isBlocked(iso, thuisId, blokkades) && !isBlocked(iso, uitId, blokkades)) break
      candidate = addDays(candidate, 7)
    }

    if (candidate > endDate) continue  // no slot found within the competition period

    const iso = toIso(candidate)
    rows.push({
      id: `w-${pouleId}-${ts}-${String(i).padStart(3, '0')}`,
      poule_id: pouleId,
      thuis_id: thuisId,
      uit_id: uitId,
      datum: iso,
      tijd: thuis.start,
      locatie_id: thuis.locatie_id,
      status: 'gepland',
    })

    lastPlayed[thuisId] = candidate
    lastPlayed[uitId] = candidate
  }

  if (rows.length === 0) return 0

  const { error } = await sb.from('wedstrijden').insert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}
