'use client'
import { useState } from 'react'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { Button } from '@/components/ui/Button'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { Toast } from '@/components/ui/Toast'
import { UitslagSheet } from '@/components/captain/UitslagSheet'
import { VerplaatsSheet } from '@/components/captain/VerplaatsSheet'
import { useData } from '@/lib/data-context'

export default function AanvoerderProgrammaPage() {
  const { data, dispatch, profile, wedstrijdenVan } = useData()
  const teamId = profile?.teamId ?? ''
  const [uitslagOpen, setUitslagOpen] = useState(false)
  const [verplaatsOpen, setVerplaatsOpen] = useState(false)
  const [selectedWId, setSelectedWId] = useState<string | undefined>()
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600) }
  const mijn = wedstrijdenVan(teamId)
  const komend = mijn.filter(w => w.status !== 'gespeeld')
  const gespeeld = mijn.filter(w => w.status === 'gespeeld')

  const handleUitslag = (wedstrijdId: string, uitslag: [number, number]) => {
    dispatch({ type: 'SET_UITSLAG', wedstrijdId, uitslag })
    setUitslagOpen(false)
    flash('Uitslag doorgegeven')
  }
  const handleVerplaats = (wedstrijdId: string, reden: string, datum: string, tijd: string) => {
    const w = data.wedstrijden.find(x => x.id === wedstrijdId)
    const aan = w ? (w.thuis_id === teamId ? w.uit_id : w.thuis_id) : ''
    dispatch({ type: 'CREATE_VERZOEK', wedstrijdId, door: teamId, aan, reden, nieuweDatum: datum, nieuweTijd: tijd })
    setVerplaatsOpen(false)
    flash('Verplaatsverzoek verstuurd')
  }

  return (
    <>
      <MobileHeader
        title="Programma"
        eyebrow="Onze wedstrijden"
        right={<Button size="sm" icon="verplaats" variant="soft" onClick={() => setVerplaatsOpen(true)}>Verplaatsen</Button>}
      />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <SectionTitle>Komende wedstrijden</SectionTitle>
          {komend.length > 0 ? (
            <List>{komend.map(w => <WedstrijdRij key={w.id} wedstrijd={w} teams={data.teams} locaties={data.locaties} highlightTeam={teamId} />)}</List>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', padding: '8px 0' }}>Geen geplande wedstrijden.</div>
          )}
        </div>
        <div>
          <SectionTitle>Uitslagen</SectionTitle>
          <List>
            {gespeeld.map(w => (
              <div key={w.id}>
                <WedstrijdRij wedstrijd={w} teams={data.teams} locaties={data.locaties} highlightTeam={teamId} />
                {!w.uitslag && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <Button full size="sm" icon="vink" onClick={() => { setSelectedWId(w.id); setUitslagOpen(true) }}>Uitslag doorgeven</Button>
                  </div>
                )}
              </div>
            ))}
          </List>
        </div>
      </div>
      <UitslagSheet open={uitslagOpen} onClose={() => setUitslagOpen(false)} wedstrijden={mijn} teams={data.teams} teamId={teamId} defaultWedstrijdId={selectedWId} onSubmit={handleUitslag} />
      <VerplaatsSheet open={verplaatsOpen} onClose={() => setVerplaatsOpen(false)} wedstrijden={mijn} alleWedstrijden={data.wedstrijden} teams={data.teams} teamId={teamId} onSubmit={handleVerplaats} />
      <Toast msg={toast} />
    </>
  )
}
