'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Pill } from '@/components/ui/Pill'
import { Icon } from '@/components/ui/Icon'
import type { AppData, Verplaatsverzoek, Wedstrijd } from '@/lib/types'
import { fmtDag, suggestiesVoor, cap } from '@/lib/utils'

interface TegenvoorstelSheetProps {
  open: boolean
  onClose: () => void
  verzoek: Verplaatsverzoek | null
  wedstrijd: Wedstrijd | null
  teams: AppData['teams']
  alleWedstrijden: Wedstrijd[]
  myTeamId: string
  onSubmit: (verzoekId: string, reden: string, datum: string, tijd: string) => void
}

export function TegenvoorstelSheet({
  open, onClose, verzoek, wedstrijd, teams, alleWedstrijden, myTeamId, onSubmit,
}: TegenvoorstelSheetProps) {
  const [reden, setReden] = useState('')
  const [datum, setDatum] = useState<string | null>(null)
  const [tijd, setTijd] = useState('20:00')
  const [handmatig, setHandmatig] = useState(false)
  const [handDatum, setHandDatum] = useState('')

  useEffect(() => {
    if (open) { setReden(''); setDatum(null); setTijd('20:00'); setHandmatig(false); setHandDatum('') }
  }, [open])

  const w = wedstrijd
  const myTeam = teams[myTeamId]
  const speelavonden = myTeam?.speelavonden ?? []

  const bezet = w
    ? alleWedstrijden
        .filter(x => x.id !== w.id && (
          x.thuis_id === w.thuis_id || x.uit_id === w.thuis_id ||
          x.thuis_id === w.uit_id || x.uit_id === w.uit_id
        ))
        .map(x => x.datum)
    : []

  const sugg = w ? suggestiesVoor(speelavonden, bezet, w.datum) : []
  const effectDatum = handmatig ? handDatum : datum
  const geldig = !!(reden.trim() && effectDatum && tijd && verzoek)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tegenvoorstel doen"
      footer={
        <Button
          full
          disabled={!geldig}
          icon="verplaats"
          onClick={() => {
            if (verzoek && effectDatum) onSubmit(verzoek.id, reden, effectDatum, tijd)
          }}
        >
          Tegenvoorstel versturen
        </Button>
      }
    >
      {w && verzoek && (
        <div style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="verplaats" size={16} color="var(--warn-ink)" />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', lineHeight: 1.5 }}>
              <strong>{teams[verzoek.door]?.naam}</strong> wil de wedstrijd van {fmtDag(w.datum)} verplaatsen naar{' '}
              <strong>{fmtDag(verzoek.nieuweDatum)}</strong> om {verzoek.nieuweTijd}.<br />
              Reden: &ldquo;{verzoek.reden}&rdquo;
            </div>
          </div>
        </div>
      )}

      <Field label="Jouw reden / toelichting">
        <Textarea
          value={reden}
          onChange={e => setReden(e.target.value)}
          placeholder="Bijv. die datum kan ik ook niet, maar dit wel"
          rows={3}
        />
      </Field>

      <div style={{ marginTop: 16 }}>
        <Field label="Voorgestelde datum">
          {myTeam && speelavonden.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '10px 12px', borderRadius: 'var(--radius)', marginBottom: 10 }}>
              <Icon name="info" size={16} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
                {myTeam.naam} speelt op {speelavonden.map(e => cap(e.dag)).join(', ')}
              </span>
            </div>
          )}
          {!handmatig && (
            <>
              {sugg.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {sugg.map(s => (
                    <Pill key={s.iso} active={datum === s.iso} onClick={() => { setDatum(s.iso); setTijd(s.tijd) }}>{s.label}</Pill>
                  ))}
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginBottom: 10 }}>
                  Geen suggesties gevonden. Voer een datum in.
                </div>
              )}
              <button onClick={() => { setHandmatig(true); setDatum(null) }}
                style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}>
                Zelf een datum invoeren
              </button>
            </>
          )}
          {handmatig && (
            <>
              <Input type="date" value={handDatum} onChange={e => setHandDatum(e.target.value)} style={{ marginBottom: 8 }} />
              <button onClick={() => { setHandmatig(false); setHandDatum('') }}
                style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}>
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
    </Sheet>
  )
}
