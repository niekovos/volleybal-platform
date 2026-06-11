import type { Dag, SpeelavondEntry } from './types'

export const DAGEN: Dag[] = ['maandag','dinsdag','woensdag','donderdag','vrijdag']
export const ALLE_DAGEN = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'] as const
export const DAG_KORT: Record<string, string> = { zondag:'zo', maandag:'ma', dinsdag:'di', woensdag:'wo', donderdag:'do', vrijdag:'vr', zaterdag:'za' }
export const MND = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']
export const DAG_NR: Record<string, number> = { zondag:0, maandag:1, dinsdag:2, woensdag:3, donderdag:4, vrijdag:5, zaterdag:6 }

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function fmtDatum(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MND[d.getMonth()]} ${d.getFullYear()}`
}

export function fmtDag(iso: string): string {
  const d = new Date(iso)
  const dagNaam = DAGEN[(d.getDay() + 6) % 7] as Dag | undefined
  const dagKort = dagNaam ? DAG_KORT[dagNaam] : '?'
  return `${dagKort} ${d.getDate()} ${MND[d.getMonth()]}`
}

// Suggest free match dates based on the home team's speelavonden.
// Starts AFTER `vanaf` (original match date), skips dates already in `bezet`.
export function suggestiesVoor(
  speelavonden: SpeelavondEntry[],
  bezet: string[],
  vanaf: string,
  n = 5
): Array<{ iso: string; label: string; tijd: string }> {
  const out: Array<{ iso: string; label: string; tijd: string }> = []
  if (speelavonden.length === 0) return out

  // Map JS getDay() number → SpeelavondEntry
  const dagMap = new Map<number, SpeelavondEntry>()
  for (const s of speelavonden) {
    const nr = DAG_NR[s.dag]
    if (nr !== undefined) dagMap.set(nr, s)
  }

  const bezetSet = new Set(bezet)
  const d = new Date(vanaf)
  let tries = 0

  while (out.length < n && tries < 365) {
    tries++
    d.setDate(d.getDate() + 1)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const entry = dagMap.get(d.getDay())
    if (entry && !bezetSet.has(iso)) {
      out.push({ iso, label: `${DAG_KORT[entry.dag] ?? '?'} ${d.getDate()} ${MND[d.getMonth()]}`, tijd: entry.tijd })
    }
  }

  return out
}

export function monogramKleur(hue: number): string {
  return `oklch(0.62 0.13 ${hue})`
}

export function isGeldig(a: number, b: number, maxSets: number): boolean {
  if (a === b || a < 0 || b < 0) return false
  const total = a + b
  if (maxSets % 2 === 1) return total === maxSets
  return total === maxSets || (total === maxSets + 1 && Math.min(a, b) === maxSets / 2)
}
