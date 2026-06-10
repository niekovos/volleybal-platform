'use client'
import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { Monogram } from '@/components/ui/Monogram'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Score } from '@/components/ui/Score'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useData } from '@/lib/data-context'
import { fmtDag } from '@/lib/utils'
import type { Wedstrijd } from '@/lib/types'

function OrgTopbar({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)' }}>{title}</h1>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function OrgProgrammaPage() {
  const { data, dispatch } = useData()
  const poulesMetTeams = Object.values(data.poules).filter(p => Object.values(data.teams).some(t => t.poule_id === p.id))
  const [poule, setPoule] = useState(poulesMetTeams[0]?.id || 'A')
  const wedstrijden = data.wedstrijden.filter(w => w.poule_id === poule)

  // Score entry modal
  const [scoreModal, setScoreModal] = useState<Wedstrijd | null>(null)
  const [sThuis, setSThuis] = useState('')
  const [sUit, setSUit] = useState('')

  const openScore = (w: Wedstrijd) => {
    setSThuis(w.uitslag ? String(w.uitslag[0]) : '')
    setSUit(w.uitslag ? String(w.uitslag[1]) : '')
    setScoreModal(w)
  }

  const saveScore = () => {
    if (!scoreModal) return
    const t = parseInt(sThuis)
    const u = parseInt(sUit)
    if (isNaN(t) || isNaN(u)) return
    dispatch({ type: 'SET_UITSLAG', wedstrijdId: scoreModal.id, uitslag: [t, u] })
    setScoreModal(null)
  }

  return (
    <>
      <OrgTopbar title="Programma" sub="Alle wedstrijden per poule" />
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {poulesMetTeams.map(p => <Pill key={p.id} active={p.id === poule} onClick={() => setPoule(p.id)}>{p.naam}</Pill>)}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 1fr 1.3fr 140px 44px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
            <div>Datum</div><div>Thuis</div><div style={{ textAlign: 'center' }}>Stand</div><div>Uit</div><div>Locatie</div><div>Status</div><div></div>
          </div>
          {wedstrijden.map((w, i) => {
            const th = data.teams[w.thuis_id]; const ui = data.teams[w.uit_id]; const l = data.locaties[w.locatie_id]
            return (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 1fr 1.3fr 140px 44px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < wedstrijden.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>
                  {fmtDag(w.datum)}
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{w.tijd}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {th && <><Monogram kort={th.kort} hue={th.hue} size={26} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{th.naam}</span></>}
                </div>
                <div style={{ textAlign: 'center' }}><Score uitslag={w.uitslag} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ui && <><Monogram kort={ui.kort} hue={ui.hue} size={26} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{ui.naam}</span></>}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-2)' }}>
                  {l?.naam}
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{l?.plaats}</div>
                </div>
                <div><StatusBadge status={w.status} small /></div>
                <div>
                  <button
                    onClick={() => openScore(w)}
                    title="Uitslag invoeren"
                    style={{ border: 'none', background: 'var(--primary-soft)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 00-3-3L5 17v3zM13.5 7.5l3 3" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
          {wedstrijden.length === 0 && (
            <div style={{ padding: '24px 18px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', textAlign: 'center' }}>
              Geen wedstrijden in deze poule.
            </div>
          )}
        </div>
      </div>

      {/* Score modal */}
      <Modal
        open={!!scoreModal}
        onClose={() => setScoreModal(null)}
        title="Uitslag invoeren"
        width={380}
        footer={
          <>
            <Button variant="ghost" onClick={() => setScoreModal(null)}>Annuleren</Button>
            <Button icon="check" disabled={sThuis === '' || sUit === ''} onClick={saveScore}>Opslaan</Button>
          </>
        }
      >
        {scoreModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  {data.teams[scoreModal.thuis_id]?.naam ?? '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Thuis</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink-3)', padding: '0 12px' }}>vs</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  {data.teams[scoreModal.uit_id]?.naam ?? '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Uit</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
              <Field label="Thuis punten">
                <Input type="number" min={0} value={sThuis} onChange={e => setSThuis(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} />
              </Field>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink-3)', paddingTop: 22, textAlign: 'center' }}>–</div>
              <Field label="Uit punten">
                <Input type="number" min={0} value={sUit} onChange={e => setSUit(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
