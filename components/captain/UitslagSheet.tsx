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
  teamId: string
  defaultWedstrijdId?: string
  onSubmit: (wedstrijdId: string, uitslag: [number, number]) => void
}

export function UitslagSheet({ open, onClose, wedstrijden, teams, teamId, defaultWedstrijdId, onSubmit }: UitslagSheetProps) {
  const kandidaten = wedstrijden.filter(w => w.status === 'gespeeld' || w.status === 'gepland')
  const [sel, setSel] = useState(defaultWedstrijdId || kandidaten[0]?.id || '')
  const [a, setA] = useState(3)
  const [b, setB] = useState(1)

  useEffect(() => {
    if (open) { setSel(defaultWedstrijdId || kandidaten[0]?.id || ''); setA(3); setB(1) }
  }, [open, defaultWedstrijdId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setA(3); setB(1) }, [sel])

  const w = wedstrijden.find(x => x.id === sel)
  const th = w ? teams[w.thuis_id] : null
  const ui = w ? teams[w.uit_id] : null
  const geldig = (a === 3 || b === 3) && a !== b

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
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 16 }}>Eindstand in sets</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {([[th, a, setA, w?.thuis_id], [ui, b, setB, w?.uit_id]] as [typeof th, number, (v: number) => void, string | undefined][]).map(([team, val, set, id]) => (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {team && <Monogram kort={team.kort} hue={team.hue} size={44} />}
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{team?.naam}</div>
              <Stepper value={val} onChange={set} />
            </div>
          ))}
        </div>
      </div>
      {!geldig && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', textAlign: 'center' }}>
          De winnaar speelt 3 sets — vul een geldige eindstand in.
        </div>
      )}
    </Sheet>
  )
}
