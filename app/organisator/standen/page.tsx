'use client'
import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Monogram } from '@/components/ui/Monogram'
import { Icon } from '@/components/ui/Icon'
import { useData } from '@/lib/data-context'
import type { Stand } from '@/lib/types'

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
  const { data, dispatch } = useData()
  const poulesMetTeams = Object.values(data.poules).filter(p => Object.values(data.teams).some(t => t.poule_id === p.id))
  const [poule, setPoule] = useState(poulesMetTeams[0]?.id || 'A')
  const [editModal, setEditModal] = useState<{ pouleId: string; teamId: string } | null>(null)

  const rijen = data.standen[poule] || []
  const editTeam = editModal ? data.teams[editModal.teamId] : null
  const editRij = editModal ? rijen.find(r => r.team_id === editModal.teamId) : null

  const [vals, setVals] = useState<Partial<Stand>>({})

  const openEdit = (teamId: string) => {
    const rij = rijen.find(r => r.team_id === teamId)
    if (rij) { setVals({ g: rij.g, w: rij.w, v: rij.v, sv: rij.sv, st: rij.st, pnt: rij.pnt }) }
    setEditModal({ pouleId: poule, teamId })
  }

  const num = (label: string, key: keyof Stand) => (
    <Field label={label}>
      <Input
        type="number"
        value={vals[key] ?? 0}
        onChange={e => setVals(v => ({ ...v, [key]: parseInt(e.target.value) || 0 }))}
      />
    </Field>
  )

  return (
    <>
      <OrgTopbar title="Standen" sub="Bekijk en corrigeer de standen handmatig" />
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {poulesMetTeams.map(p => <Pill key={p.id} active={p.id === poule} onClick={() => setPoule(p.id)}>{p.naam}</Pill>)}
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>Klik op een team om de stand handmatig te corrigeren</span>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 720 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 50px 50px 80px 60px 40px', gap: 8, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
            <div>#</div><div>Team</div><div style={{ textAlign: 'center' }}>G</div><div style={{ textAlign: 'center' }}>W</div><div style={{ textAlign: 'center' }}>V</div><div style={{ textAlign: 'center' }}>Sets</div><div style={{ textAlign: 'right' }}>Pnt</div><div></div>
          </div>
          {rijen.map((r, i) => {
            const t = data.teams[r.team_id]
            return (
              <div key={r.team_id} onClick={() => openEdit(r.team_id)} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 50px 50px 80px 60px 40px', gap: 8, padding: '11px 18px', alignItems: 'center', borderBottom: i < rijen.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer' }}>
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
                <div style={{ textAlign: 'right' }}><Icon name="potlood" size={15} color="var(--ink-3)" /></div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editTeam ? `Stand bewerken — ${editTeam.naam}` : 'Stand bewerken'}
        width={480}
        footer={<>
          <Button variant="ghost" onClick={() => setEditModal(null)}>Annuleren</Button>
          <Button icon="check" onClick={() => { if (editModal) dispatch({ type: 'UPDATE_STAND', pouleId: editModal.pouleId, teamId: editModal.teamId, vals }); setEditModal(null) }}>Opslaan</Button>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {num('Gespeeld', 'g')}
          {num('Gewonnen', 'w')}
          {num('Verloren', 'v')}
          {num('Sets voor', 'sv')}
          {num('Sets tegen', 'st')}
          {num('Punten', 'pnt')}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.5 }}>
          Normaal worden deze waarden automatisch berekend uit doorgegeven uitslagen. Handmatig aanpassen gebruik je alleen voor correcties.
        </div>
      </Modal>
    </>
  )
}
