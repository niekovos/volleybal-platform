'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { MapPlaceholder } from '@/components/ui/MapPlaceholder'
import { useData } from '@/lib/data-context'

function OrgTopbar({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)' }}>{title}</h1>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>{actions}</div>
    </div>
  )
}

export default function LocatiesPage() {
  const { data, dispatch, teamsInLocatie } = useData()
  const [modal, setModal] = useState<{ locId?: string } | null>(null)

  const locatie = modal?.locId ? data.locaties[modal.locId] : null
  const [naam, setNaam] = useState(''); const [plaats, setPlaats] = useState('')
  const [adres, setAdres] = useState(''); const [velden, setVelden] = useState(2)

  const openEdit = (locId: string) => {
    const l = data.locaties[locId]
    if (!l) return
    setNaam(l.naam); setPlaats(l.plaats); setAdres(l.adres); setVelden(l.velden)
    setModal({ locId })
  }
  const openNew = () => { setNaam(''); setPlaats(''); setAdres(''); setVelden(2); setModal({}) }

  const save = () => {
    if (modal?.locId) dispatch({ type: 'UPDATE_LOCATIE', locatieId: modal.locId, data: { naam, plaats, adres, velden } })
    else dispatch({ type: 'CREATE_LOCATIE', data: { naam, plaats, adres, velden } })
    setModal(null)
  }

  return (
    <>
      <OrgTopbar title="Locaties" sub="Speellocaties en adressen" actions={<Button size="sm" icon="plus" onClick={openNew}>Locatie toevoegen</Button>} />
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 860 }}>
          {Object.values(data.locaties).map(l => {
            const teams = teamsInLocatie(l.id)
            return (
              <Card key={l.id} pad={0} style={{ overflow: 'hidden' }}>
                <MapPlaceholder label={l.naam} height={96} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{l.naam}</div>
                    <button onClick={() => openEdit(l.id)} style={{ border: 'none', background: 'var(--surface-2)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="potlood" size={15} color="var(--ink-2)" />
                    </button>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{l.adres}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Icon name="net" size={13} color="var(--ink-3)" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)' }}>{l.velden} speelvelden</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {teams.map(t => <Monogram key={t.id} kort={t.kort} hue={t.hue} size={26} />)}
                    {!teams.length && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>Geen vaste teams</span>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.locId ? 'Locatie bewerken' : 'Nieuwe locatie'}
        width={480}
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Annuleren</Button>
          <Button icon="check" disabled={!naam.trim()} onClick={save}>{modal?.locId ? 'Opslaan' : 'Aanmaken'}</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Naam sporthal"><Input value={naam} onChange={e => setNaam(e.target.value)} placeholder="Bijv. Sporthal De Marsdijk" /></Field>
          <Field label="Plaats"><Input value={plaats} onChange={e => setPlaats(e.target.value)} placeholder="Assen" /></Field>
          <Field label="Adres"><Input value={adres} onChange={e => setAdres(e.target.value)} placeholder="Straatnaam 1, 9400 AA Assen" /></Field>
          <Field label="Aantal speelvelden"><Input type="number" value={velden} onChange={e => setVelden(parseInt(e.target.value) || 1)} /></Field>
        </div>
      </Modal>
    </>
  )
}
