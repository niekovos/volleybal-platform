'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import type { Dag, Blokkade } from '@/lib/types'
import { DAGEN, cap, fmtDatum } from '@/lib/utils'

const ALL_DAGEN = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag']

interface BeschikbaarSheetProps {
  open: boolean
  onClose: () => void
  teamAvond: Dag
  teamStart: string
  teamBlokkades: Blokkade[]
  teamTrainingsAvond?: string | null
  teamTrainingsTijd?: string | null
  onSubmit: (avond: Dag, start: string, blokkades: Blokkade[], trainingsAvond: string | null, trainingsTijd: string | null) => void
}

export function BeschikbaarSheet({ open, onClose, teamAvond, teamStart, teamBlokkades, teamTrainingsAvond, teamTrainingsTijd, onSubmit }: BeschikbaarSheetProps) {
  const [avond, setAvond] = useState<Dag>(teamAvond)
  const [start, setStart] = useState(teamStart)
  const [trainingsAvond, setTrainingsAvond] = useState<string | null>(teamTrainingsAvond ?? null)
  const [trainingsTijd, setTrainingsTijd] = useState<string | null>(teamTrainingsTijd ?? null)
  const [blokkades, setBlokkades] = useState<Blokkade[]>(teamBlokkades)
  const [showAdd, setShowAdd] = useState(false)
  const [nieuwVan, setNieuwVan] = useState('')
  const [nieuwTot, setNieuwTot] = useState('')
  const [nieuwReden, setNieuwReden] = useState('')

  useEffect(() => {
    if (open) {
      setAvond(teamAvond)
      setStart(teamStart)
      setTrainingsAvond(teamTrainingsAvond ?? null)
      setTrainingsTijd(teamTrainingsTijd ?? null)
      setBlokkades(teamBlokkades)
      setShowAdd(false)
    }
  }, [open, teamAvond, teamStart, teamBlokkades, teamTrainingsAvond, teamTrainingsTijd])

  const addBlokkade = () => {
    if (!nieuwVan || !nieuwTot) return
    setBlokkades(bs => [...bs, { id: Date.now().toString(), van: nieuwVan, tot: nieuwTot, reden: nieuwReden || 'Niet beschikbaar' }])
    setNieuwVan(''); setNieuwTot(''); setNieuwReden(''); setShowAdd(false)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Beschikbaarheid & training"
      footer={<Button full icon="check" onClick={() => onSubmit(avond, start, blokkades, trainingsAvond, trainingsTijd)}>Opslaan</Button>}
    >
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 0 }}>
        Op welke avond kunnen jullie thuiswedstrijden spelen? Dit gebruikt de planner om data voor te stellen.
      </p>
      <Field label="Speelavond">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DAGEN.map(d => {
            const on = avond === d
            return (
              <button
                key={d}
                onClick={() => setAvond(d)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary-soft)' : 'var(--surface)',
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 7, border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon name="check" size={16} color="var(--primary-ink)" />}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{cap(d)}</span>
              </button>
            )
          })}
        </div>
      </Field>
      <div style={{ marginTop: 18 }}>
        <Field label="Standaard aanvangstijd wedstrijden">
          <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
        </Field>
      </div>

      {/* Training section */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Training</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 0, marginBottom: 14 }}>
          Op welke dag en hoe laat trainen jullie?
        </p>
        <Field label="Trainingsavond">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_DAGEN.map(d => {
              const on = trainingsAvond === d
              return (
                <button
                  key={d}
                  onClick={() => setTrainingsAvond(on ? null : d)}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                    background: on ? 'var(--primary-soft)' : 'var(--surface)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: on ? 700 : 500,
                    color: on ? 'var(--primary)' : 'var(--ink-2)',
                  }}
                >
                  {cap(d)}
                </button>
              )
            })}
          </div>
        </Field>
        {trainingsAvond && (
          <div style={{ marginTop: 14 }}>
            <Field label="Aanvangstijd training">
              <Input type="time" value={trainingsTijd ?? ''} onChange={e => setTrainingsTijd(e.target.value || null)} />
            </Field>
          </div>
        )}
      </div>

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
