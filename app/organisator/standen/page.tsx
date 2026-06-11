'use client'
import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { Monogram } from '@/components/ui/Monogram'
import { useData } from '@/lib/data-context'

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

export default function OrgStandenPage() {
  const { data } = useData()
  const poulesMetTeams = Object.values(data.poules).filter(p => Object.values(data.teams).some(t => t.poule_id === p.id))
  const [poule, setPoule] = useState(poulesMetTeams[0]?.id || 'A')

  const rijen = data.standen[poule] || []

  return (
    <>
      <OrgTopbar title="Standen" sub="Automatisch berekend uit doorgegeven uitslagen" />
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {poulesMetTeams.map(p => <Pill key={p.id} active={p.id === poule} onClick={() => setPoule(p.id)}>{p.naam}</Pill>)}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 720 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 50px 50px 80px 60px', gap: 8, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
            <div>#</div><div>Team</div><div style={{ textAlign: 'center' }}>G</div><div style={{ textAlign: 'center' }}>W</div><div style={{ textAlign: 'center' }}>V</div><div style={{ textAlign: 'center' }}>Sets</div><div style={{ textAlign: 'right' }}>Pnt</div>
          </div>
          {rijen.map((r, i) => {
            const t = data.teams[r.team_id]
            return (
              <div key={r.team_id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 50px 50px 80px 60px', gap: 8, padding: '11px 18px', alignItems: 'center', borderBottom: i < rijen.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--ink-3)' }}>{i + 1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {t && <Monogram kort={t.kort} hue={t.hue} size={28} />}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t?.naam}</span>
                </div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-num)', color: 'var(--ink-2)' }}>{r.g}</div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-num)', color: 'var(--ink-2)' }}>{r.w}</div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-num)', color: 'var(--ink-2)' }}>{r.v}</div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-num)', fontSize: 13, color: 'var(--ink-3)' }}>{r.sv}–{r.st}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--ink)' }}>{r.pnt}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
