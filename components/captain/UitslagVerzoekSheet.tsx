'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Monogram } from '@/components/ui/Monogram'
import { Stepper } from '@/components/ui/Stepper'
import type { AppData, UitslagVerzoek } from '@/lib/types'
import { fmtDag, isGeldig } from '@/lib/utils'

interface UitslagVerzoekSheetProps {
  open: boolean
  onClose: () => void
  verzoek: UitslagVerzoek | null
  teams: AppData['teams']
  poules: AppData['poules']
  wedstrijden: AppData['wedstrijden']
  myTeamId: string
  onGoedkeuren: (verzoekId: string) => void
  onCorrigeren: (verzoekId: string, uitslag: [number, number]) => void
  onAfwijzen: (verzoekId: string) => void
}

export function UitslagVerzoekSheet({
  open, onClose, verzoek, teams, poules, wedstrijden, myTeamId,
  onGoedkeuren, onCorrigeren, onAfwijzen,
}: UitslagVerzoekSheetProps) {
  const [mode, setMode] = useState<'bekijken' | 'corrigeren'>('bekijken')
  const [a, setA] = useState(3)
  const [b, setB] = useState(1)

  const w = verzoek ? wedstrijden.find(x => x.id === verzoek.wedstrijd_id) : null
  const maxSets = (w?.poule_id ? poules[w.poule_id]?.maxSets : null) ?? 4
  const th = w ? teams[w.thuis_id] : null
  const ui = w ? teams[w.uit_id] : null
  const indiener = verzoek ? teams[verzoek.ingediend_door] : null

  useEffect(() => {
    if (open) {
      setMode('bekijken')
      setA(verzoek?.uitslag_thuis ?? 3)
      setB(verzoek?.uitslag_uit ?? 1)
    }
  }, [open, verzoek])

  const geldig = isGeldig(a, b, maxSets)

  if (!verzoek || !w) return null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={mode === 'bekijken' ? 'Uitslag bevestigen' : 'Uitslag aanpassen'}
      footer={
        mode === 'bekijken' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button full icon="check" onClick={() => { onGoedkeuren(verzoek.id); onClose() }}>
              Uitslag klopt — bevestigen
            </Button>
            <Button full variant="soft" onClick={() => setMode('corrigeren')}>
              Aanpassen
            </Button>
            <Button full variant="ghost" onClick={() => { onAfwijzen(verzoek.id); onClose() }}>
              Afwijzen (escaleren naar organisator)
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => setMode('bekijken')}>Terug</Button>
            <Button
              full
              icon="check"
              disabled={!geldig}
              onClick={() => { onCorrigeren(verzoek.id, [a, b]); onClose() }}
            >
              Gecorrigeerde uitslag versturen
            </Button>
          </div>
        )
      }
    >
      {/* Match info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
          {fmtDag(w.datum)} · {w.tijd} · ingediend door {indiener?.naam}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {th && <Monogram kort={th.kort} hue={th.hue} size={36} />}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{th?.naam}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
              {verzoek.uitslag_thuis}–{verzoek.uitslag_uit}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>sets</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {ui && <Monogram kort={ui.kort} hue={ui.hue} size={36} />}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{ui?.naam}</span>
          </div>
        </div>
      </div>

      {/* Correction steppers */}
      {mode === 'corrigeren' && (
        <>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 16 }}>
            Vul de correcte uitstand in sets in ({maxSets} sets)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {([[th, a, setA, w.thuis_id], [ui, b, setB, w.uit_id]] as [typeof th, number, (v: number) => void, string][]).map(
              ([team, val, set, id]) => (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  {team && <Monogram kort={team.kort} hue={team.hue} size={36} />}
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{team?.naam}</div>
                  <Stepper value={val} onChange={set} max={maxSets} />
                </div>
              )
            )}
          </div>
          {!geldig && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', textAlign: 'center', marginTop: 12 }}>
              Ongeldige uitstand voor {maxSets} sets.
            </div>
          )}
        </>
      )}

      {mode === 'bekijken' && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
          Klopt deze uitslag? Kies <em>Bevestigen</em> als hij correct is, <em>Aanpassen</em> als je een correctie wilt doorgeven, of <em>Afwijzen</em> als er een geschil is dat de organisator moet oplossen.
        </div>
      )}
    </Sheet>
  )
}
