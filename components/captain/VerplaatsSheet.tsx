'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Select, Input, Textarea } from '@/components/ui/Field'
import { Pill } from '@/components/ui/Pill'
import { Icon } from '@/components/ui/Icon'
import type { AppData, Wedstrijd } from '@/lib/types'
import { fmtDag, suggestiesVoor, cap } from '@/lib/utils'

interface VerplaatsSheetProps {
  open: boolean
  onClose: () => void
  wedstrijden: Wedstrijd[]
  teams: AppData['teams']
  teamId: string
  onSubmit: (wedstrijdId: string, reden: string, datum: string, tijd: string) => void
}

export function VerplaatsSheet({ open, onClose, wedstrijden, teams, teamId, onSubmit }: VerplaatsSheetProps) {
  const komend = wedstrijden.filter(w => w.status === 'gepland')
  const [sel, setSel] = useState(komend[0]?.id || '')
  const [reden, setReden] = useState('')
  const [datum, setDatum] = useState<string | null>(null)
  const [tijd, setTijd] = useState('20:00')
  const [handmatig, setHandmatig] = useState(false)
  const [handDatum, setHandDatum] = useState('')

  useEffect(() => {
    if (open) { setSel(komend[0]?.id || ''); setReden(''); setDatum(null); setTijd('20:00'); setHandmatig(false); setHandDatum('') }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const w = wedstrijden.find(x => x.id === sel)
  const tegenstander = w ? teams[w.thuis_id === teamId ? w.uit_id : w.thuis_id] : null
  const sugg = tegenstander ? suggestiesVoor(tegenstander.avond) : []
  const effectDatum = handmatig ? handDatum : datum
  const geldig = reden.trim() && effectDatum && tijd

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Wedstrijd verplaatsen"
      footer={
        <Button
          full
          disabled={!geldig}
          icon="verplaats"
          onClick={() => { if (w && effectDatum) onSubmit(w.id, reden, effectDatum, tijd) }}
        >
          Verzoek versturen naar {tegenstander?.kort || '...'}
        </Button>
      }
    >
      <Field label="Welke wedstrijd?">
        <Select value={sel} onChange={e => setSel(e.target.value)}>
          {komend.map(m => (
            <option key={m.id} value={m.id}>
              {teams[m.thuis_id]?.kort} – {teams[m.uit_id]?.kort} · {fmtDag(m.datum)}
            </option>
          ))}
        </Select>
      </Field>
      <div style={{ marginTop: 16 }}>
        <Field label="Reden">
          <Textarea
            value={reden}
            onChange={e => setReden(e.target.value)}
            placeholder="Bijv. te weinig spelers beschikbaar door vakantie"
            rows={3}
          />
        </Field>
      </div>
      <div style={{ marginTop: 18 }}>
        <Field label="Nieuwe datum voorstellen">
          {tegenstander && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '10px 12px', borderRadius: 'var(--radius)', marginBottom: 10 }}>
              <Icon name="info" size={16} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
                {tegenstander.naam} speelt op {cap(tegenstander.avond)}
              </span>
            </div>
          )}
          {!handmatig && (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {sugg.map(s => (
                  <Pill key={s.iso} active={datum === s.iso} onClick={() => setDatum(s.iso)}>{s.label}</Pill>
                ))}
              </div>
              <button
                onClick={() => { setHandmatig(true); setDatum(null) }}
                style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}
              >
                Zelf een datum invoeren
              </button>
            </>
          )}
          {handmatig && (
            <>
              <Input type="date" value={handDatum} onChange={e => setHandDatum(e.target.value)} style={{ marginBottom: 8 }} />
              <button
                onClick={() => { setHandmatig(false); setHandDatum('') }}
                style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}
              >
                Terug naar suggesties
              </button>
            </>
          )}
        </Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field label="Aanvangstijd">
          <Input type="time" value={tijd} onChange={e => setTijd(e.target.value)} />
        </Field>
      </div>
      {tegenstander && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          {tegenstander.naam} ontvangt je verzoek en kan het goedkeuren of afwijzen.
        </div>
      )}
    </Sheet>
  )
}
