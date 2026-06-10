'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import type { Blokkade, SpeelavondEntry } from '@/lib/types'
import { ALLE_DAGEN, cap, fmtDatum } from '@/lib/utils'

interface BeschikbaarSheetProps {
  open: boolean
  onClose: () => void
  teamSpeelavonden: SpeelavondEntry[]
  teamBlokkades: Blokkade[]
  onSubmit: (speelavonden: SpeelavondEntry[], blokkades: Blokkade[]) => void
}

export function BeschikbaarSheet({ open, onClose, teamSpeelavonden, teamBlokkades, onSubmit }: BeschikbaarSheetProps) {
  const [avonden, setAvonden] = useState<SpeelavondEntry[]>(teamSpeelavonden)
  const [blokkades, setBlokkades] = useState<Blokkade[]>(teamBlokkades)
  const [showAdd, setShowAdd] = useState(false)
  const [nieuwVan, setNieuwVan] = useState('')
  const [nieuwTot, setNieuwTot] = useState('')
  const [nieuwReden, setNieuwReden] = useState('')

  useEffect(() => {
    if (open) {
      setAvonden(teamSpeelavonden)
      setBlokkades(teamBlokkades)
      setShowAdd(false)
    }
  }, [open, teamSpeelavonden, teamBlokkades])

  const addAvond = () => {
    setAvonden(av => [...av, { dag: 'maandag', tijd: '20:00' }])
  }

  const updateAvond = (i: number, field: keyof SpeelavondEntry, val: string) => {
    setAvonden(av => av.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }

  const removeAvond = (i: number) => {
    setAvonden(av => av.filter((_, idx) => idx !== i))
  }

  const addBlokkade = () => {
    if (!nieuwVan || !nieuwTot) return
    setBlokkades(bs => [...bs, { id: Date.now().toString(), van: nieuwVan, tot: nieuwTot, reden: nieuwReden || 'Niet beschikbaar' }])
    setNieuwVan(''); setNieuwTot(''); setNieuwReden(''); setShowAdd(false)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Beschikbaarheid"
      footer={<Button full icon="check" onClick={() => onSubmit(avonden, blokkades)}>Opslaan</Button>}
    >
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 0 }}>
        Op welke avonden kunnen jullie wedstrijden spelen? De planner gebruikt dit om data voor te stellen.
      </p>

      {/* Speelavonden repeater */}
      <Field label="Speelavonden">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {avonden.map((entry, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={entry.dag}
                onChange={e => updateAvond(i, 'dag', e.target.value)}
                style={{
                  flex: 1, padding: '10px 12px', border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)',
                  fontSize: 14, background: 'var(--surface)', color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                {ALLE_DAGEN.map(d => (
                  <option key={d} value={d}>{cap(d)}</option>
                ))}
              </select>
              <Input
                type="time"
                value={entry.tijd}
                onChange={e => updateAvond(i, 'tijd', e.target.value)}
                style={{ width: 110, flexShrink: 0 }}
              />
              <button
                onClick={() => removeAvond(i)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6, flexShrink: 0, display: 'flex' }}
              >
                <Icon name="x" size={18} color="var(--ink-3)" />
              </button>
            </div>
          ))}
          <Button size="sm" variant="soft" icon="plus" full onClick={addAvond}>
            Speelavond toevoegen
          </Button>
        </div>
      </Field>

      {/* Blokkades */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>Niet beschikbaar</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, marginTop: 0, marginBottom: 12 }}>
          Geef periodes op waarin jullie niet kunnen spelen (bijv. schoolvakanties, feestdagen).
        </p>
        {blokkades.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {blokkades.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--warn)', background: 'var(--warn-soft)' }}>
                <Icon name="programma" size={18} color="var(--warn-ink)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{b.reden}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{fmtDatum(b.van)} – {fmtDatum(b.tot)}</div>
                </div>
                <button onClick={() => setBlokkades(bs => bs.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="x" size={18} color="var(--warn-ink)" />
                </button>
              </div>
            ))}
          </div>
        )}
        {!showAdd ? (
          <Button size="sm" variant="soft" icon="plus" full onClick={() => setShowAdd(true)}>Periode toevoegen</Button>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Reden">
              <Input value={nieuwReden} onChange={e => setNieuwReden(e.target.value)} placeholder="Bijv. Voorjaarsvakantie, Kerst" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Van"><Input type="date" value={nieuwVan} onChange={e => setNieuwVan(e.target.value)} /></Field>
              <Field label="Tot en met"><Input type="date" value={nieuwTot} onChange={e => setNieuwTot(e.target.value)} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" icon="check" disabled={!nieuwVan || !nieuwTot} onClick={addBlokkade}>Toevoegen</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Annuleren</Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}
