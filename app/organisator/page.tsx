'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useData } from '@/lib/data-context'
import { fmtDag, isGeldig } from '@/lib/utils'
import type { UitslagVerzoek } from '@/lib/types'

function OrgTopbar({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)' }}>{title}</h1>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function OrganizerDashboard() {
  const { data, dispatch } = useData()

  const teams = Object.keys(data.teams).length
  const competities = Object.keys(data.competities).length
  const locaties = Object.keys(data.locaties).length
  const gespeeld = data.wedstrijden.filter(w => w.status === 'gespeeld' && w.uitslag).length
  const teVullen = data.wedstrijden.filter(w => w.status === 'gespeeld' && !w.uitslag)
  const recent = data.wedstrijden.filter(w => w.status === 'gespeeld' && w.uitslag).slice(-4).reverse()

  // Escalated uitslag verzoeken
  const geescaleerd = data.uitslag_verzoeken.filter(v => v.status === 'geescaleerd')

  // Score modal for escalated scores
  const [escModal, setEscModal] = useState<UitslagVerzoek | null>(null)
  const [sThuis, setSThuis] = useState('')
  const [sUit, setSUit] = useState('')

  const openEscalatie = (vz: UitslagVerzoek) => {
    setSThuis('')
    setSUit('')
    setEscModal(vz)
  }

  const escWedstrijd = escModal ? data.wedstrijden.find(w => w.id === escModal.wedstrijd_id) : null
  const escMaxSets = escWedstrijd ? (data.poules[escWedstrijd.poule_id]?.maxSets ?? 4) : 4
  const escT = parseInt(sThuis)
  const escU = parseInt(sUit)
  const escGeldig = !isNaN(escT) && !isNaN(escU) && isGeldig(escT, escU, escMaxSets)

  const saveEscalatie = () => {
    if (!escModal || !escGeldig) return
    dispatch({ type: 'SLUIT_ESCALATIE', wedstrijdId: escModal.wedstrijd_id, uitslag: [escT, escU] })
    setEscModal(null)
  }

  const kpi = (label: string, val: number, icon: string, color: string) => (
    <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-num)', fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>{val}</div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color="#fff" />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{label}</div>
    </div>
  )

  return (
    <>
      <OrgTopbar title="Dashboard" sub="Recreatiecompetitie Assen e.o. · Seizoen 2025–2026" />
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {kpi('Competities', competities, 'trofee', 'var(--primary)')}
          {kpi('Teams', teams, 'team', 'oklch(0.6 0.13 250)')}
          {kpi('Gespeeld', gespeeld, 'vink', 'var(--positive)')}
          {kpi('Locaties', locaties, 'pin', 'oklch(0.6 0.12 45)')}
        </div>

        {/* Geëscaleerde uitslagen — ingrijpen nodig */}
        {geescaleerd.length > 0 && (
          <div style={{ background: 'var(--warn-soft)', border: '2px solid var(--warn)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="vink" size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--warn-ink)' }}>
                Uitslagen geëscaleerd — ingrijpen vereist
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {geescaleerd.map(vz => {
                const w = data.wedstrijden.find(x => x.id === vz.wedstrijd_id)
                const th = w ? data.teams[w.thuis_id] : null
                const ui = w ? data.teams[w.uit_id] : null
                const indiener = data.teams[vz.ingediend_door]
                return (
                  <div key={vz.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>
                        {w ? fmtDag(w.datum) : '—'} · ingediend door {indiener?.naam}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {th && <><Monogram kort={th.kort} hue={th.hue} size={26} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{th.naam}</span></>}
                        <span style={{ fontFamily: 'var(--font-num)', fontSize: 18, fontWeight: 800, color: 'var(--warn-ink)', margin: '0 8px' }}>
                          {vz.uitslag_thuis}–{vz.uitslag_uit}
                        </span>
                        {ui && <><Monogram kort={ui.kort} hue={ui.hue} size={26} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{ui.naam}</span></>}
                      </div>
                    </div>
                    <Button size="sm" variant="soft" onClick={() => openEscalatie(vz)}>
                      Definitieve uitslag invoeren
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            {teVullen.length > 0 && (
              <>
                <SectionTitle>Uitslag nog niet binnen</SectionTitle>
                <List>{teVullen.map(w => <WedstrijdRij key={w.id} wedstrijd={w} teams={data.teams} locaties={data.locaties} showPoule pouleName={data.poules[w.poule_id]?.naam} />)}</List>
                <div style={{ height: 18 }} />
              </>
            )}
            <Card pad={18} style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="info" size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>Verplaatsverzoeken</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
                    Verplaatsverzoeken worden direct afgehandeld tussen aanvoerders.
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div>
            <SectionTitle action="Programma" onAction={() => {}}>
              <Link href="/organisator/programma" style={{ textDecoration: 'none', color: 'inherit' }}>Recente uitslagen</Link>
            </SectionTitle>
            <List>{recent.map(w => <WedstrijdRij key={w.id} wedstrijd={w} teams={data.teams} locaties={data.locaties} showPoule pouleName={data.poules[w.poule_id]?.naam} />)}</List>
          </div>
        </div>
      </div>

      {/* Escalatie modal */}
      {escModal && escWedstrijd && (
        <Modal
          open
          onClose={() => setEscModal(null)}
          title="Definitieve uitslag invoeren"
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => setEscModal(null)}>Annuleren</Button>
              <Button disabled={!escGeldig} onClick={saveEscalatie}>Opslaan</Button>
            </div>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>
              {fmtDag(escWedstrijd.datum)} · {data.teams[escWedstrijd.thuis_id]?.naam} vs {data.teams[escWedstrijd.uit_id]?.naam}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', marginBottom: 12 }}>
              Ingediend: <strong>{escModal.uitslag_thuis}–{escModal.uitslag_uit}</strong>. De teams zijn het niet eens. Voer de definitieve uitslag in.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label={`Sets ${data.teams[escWedstrijd.thuis_id]?.naam ?? 'Thuis'}`}>
              <Input type="number" min={0} max={escMaxSets} value={sThuis} onChange={e => setSThuis(e.target.value)} placeholder="0" />
            </Field>
            <Field label={`Sets ${data.teams[escWedstrijd.uit_id]?.naam ?? 'Uit'}`}>
              <Input type="number" min={0} max={escMaxSets} value={sUit} onChange={e => setSUit(e.target.value)} placeholder="0" />
            </Field>
          </div>
          {sThuis && sUit && !escGeldig && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', marginTop: 10 }}>
              Ongeldige uitstand voor {escMaxSets} sets.
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
