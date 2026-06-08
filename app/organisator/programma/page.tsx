'use client'
import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { Monogram } from '@/components/ui/Monogram'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Score } from '@/components/ui/Score'
import { useData } from '@/lib/data-context'
import { fmtDag } from '@/lib/utils'

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
  const { data } = useData()
  const poulesMetTeams = Object.values(data.poules).filter(p => Object.values(data.teams).some(t => t.poule_id === p.id))
  const [poule, setPoule] = useState(poulesMetTeams[0]?.id || 'A')
  const wedstrijden = data.wedstrijden.filter(w => w.poule_id === poule)

  return (
    <>
      <OrgTopbar title="Programma" sub="Alle wedstrijden per poule" />
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {poulesMetTeams.map(p => <Pill key={p.id} active={p.id === poule} onClick={() => setPoule(p.id)}>{p.naam}</Pill>)}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 1fr 1.3fr 140px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
            <div>Datum</div><div>Thuis</div><div style={{ textAlign: 'center' }}>Stand</div><div>Uit</div><div>Locatie</div><div>Status</div>
          </div>
          {wedstrijden.map((w, i) => {
            const th = data.teams[w.thuis_id]; const ui = data.teams[w.uit_id]; const l = data.locaties[w.locatie_id]
            return (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 1fr 1.3fr 140px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < wedstrijden.length - 1 ? '1px solid var(--line)' : 'none' }}>
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
    </>
  )
}
