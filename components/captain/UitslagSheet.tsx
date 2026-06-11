'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Field'
import { Monogram } from '@/components/ui/Monogram'
import { Stepper } from '@/components/ui/Stepper'
import type { AppData, Wedstrijd } from '@/lib/types'
import { fmtDag } from '@/lib/utils'

interface UitslagSheetProps {
  open: boolean
  onClose: () => void
  wedstrijden: Wedstrijd[]
  teams: AppData['teams']
  poules: AppData['poules']
  teamId: string
  defaultWedstrijdId?: string
  onSubmit: (wedstrijdId: string, uitslag: [number, number]) => void
}

function isGeldig(a: number, b: number, maxSets: number): boolean {
  if (a === b) return false
  const total = a + b
  if (maxSets % 2 === 1) {
    // odd: play all N sets, no tiebreak possible
    return total === maxSets
  }
  // even: play all N sets; if tied (N/2 each), play one extra tiebreak set
  return (total === maxSets) || (total === maxSets + 1 && Math.min(a, b) === maxSets / 2)
}

function defaultScore(maxSets: number): [number, number] {
  if (maxSets % 2 === 0) return [maxSets / 2 + 1, maxSets / 2 - 1]
  return [Math.ceil(maxSets / 2), Math.floor(maxSets / 2)]
}

export function UitslagSheet({ open, onClose, wedstrijden, teams, poules, teamId, defaultWedstrijdId, onSubmit }: UitslagSheetProps) {
  const today = new Date().toISOString().split('T')[0]
  const kandidaten = wedstrijden.filter(w =>
    (w.status === 'gespeeld' || w.status === 'gepland') && w.datum <= today
  )
  const [sel, setSel] = useState(defaultWedstrijdId || kandidaten[0]?.id || '')
  const [a, setA] = useState(3)
  const [b, setB] = useState(1)

  const w = wedstrijden.find(x => x.id === sel)
  const maxSets = (w?.poule_id ? poules[w.poule_id]?.maxSets : null) ?? 4

  useEffect(() => {
    if (open) {
      setSel(defaultWedstrijdId || kandidaten[0]?.id || '')
      const [da, db] = defaultScore(maxSets)
      setA(da); setB(db)
    }
  }, [open, defaultWedstrijdId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const [da, db] = defaultScore(maxSets)
    setA(da); setB(db)
  }, [sel, maxSets])

  const th = w ? teams[w.thuis_id] : null
  const ui = w ? teams[w.uit_id] : null
  const geldig = isGeldig(a, b, maxSets)

  const isTiebreakSituatie = maxSets % 2 === 0
  const validatieTekst = isTiebreakSituatie
    ? `Bij ${maxSets / 2}-${maxSets / 2} wordt een tiebreak gespeeld. Eindstand: bijv. ${maxSets / 2 + 1}-${maxSets / 2 - 1} of ${maxSets / 2 + 1}-${maxSets / 2}.`
    : `Er worden ${maxSets} sets gespeeld. Vul het aantal gewonnen sets per team in.`

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Uitslag doorgeven"
      footer={
        <Button full disabled={!geldig || !w} icon="check" onClick={() => { if (w) onSubmit(w.id, [a, b]) }}>
          Uitslag versturen
        </Button>
      }
    >
      <Field label="Wedstrijd">
        <Select value={sel} onChange={e => setSel(e.target.value)}>
          {kandidaten.map(m => (
            <option key={m.id} value={m.id}>
              {teams[m.thuis_id]?.kort} – {teams[m.uit_id]?.kort} · {fmtDag(m.datum)}
            </option>
          ))}
        </Select>
      </Field>
      <div style={{ margin: '20px 0', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '20px 16px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 16 }}>
          Eindstand in sets ({maxSets} sets)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {([[th, a, setA, w?.thuis_id], [ui, b, setB, w?.uit_id]] as [typeof th, number, (v: number) => void, string | undefined][]).map(([team, val, set, id]) => (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {team && <Monogram kort={team.kort} hue={team.hue} size={44} />}
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{team?.naam}</div>
              <Stepper value={val} onChange={set} max={maxSets} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: geldig ? 'var(--ink-3)' : 'var(--warn-ink)', textAlign: 'center', lineHeight: 1.5 }}>
        {geldig ? validatieTekst : `Ongeldige uitstand. ${validatieTekst}`}
      </div>
    </Sheet>
  )
}
