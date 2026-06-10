import type { Dag } from './types'

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

export function suggestiesVoor(avond: Dag, n = 3): Array<{ iso: string; label: string }> {
  const out: Array<{ iso: string; label: string }> = []
  const target = DAG_NR[avond]
  const d = new Date()
  while (out.length < n) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() === target) {
      out.push({
        iso: d.toISOString().slice(0, 10),
        label: `${DAG_KORT[avond]} ${d.getDate()} ${MND[d.getMonth()]}`,
      })
    }
  }
  return out
}

export function monogramKleur(hue: number): string {
  return `oklch(0.62 0.13 ${hue})`
}
