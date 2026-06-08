'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { Row } from '@/components/ui/Row'
import { Icon } from '@/components/ui/Icon'
import { MapPlaceholder } from '@/components/ui/MapPlaceholder'
import { useData } from '@/lib/data-context'
import { cap } from '@/lib/utils'

export default function LocatieDetailPage({ params }: { params: Promise<{ locatieId: string }> }) {
  const { locatieId } = use(params)
  const { data, teamsInLocatie } = useData()
  const router = useRouter()

  const l = data.locaties[locatieId]
  if (!l) return <div style={{ padding: 18, color: 'var(--ink-3)' }}>Locatie niet gevonden.</div>

  const teams = teamsInLocatie(locatieId)

  return (
    <>
      <MobileHeader title={l.naam} eyebrow={l.plaats} onBack={() => router.back()} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <MapPlaceholder label={l.naam} height={150} />
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)' }}>
              <Icon name="pin" size={17} color="var(--primary)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>{l.adres}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)', marginTop: 8 }}>
              <Icon name="net" size={17} color="var(--primary)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>{l.velden} speelvelden</span>
            </div>
          </div>
        </Card>

        <div>
          <SectionTitle>Teams die hier spelen</SectionTitle>
          {teams.length > 0 ? (
            <List>
              {teams.map(t => (
                <Row
                  key={t.id}
                  icon="team"
                  title={t.naam}
                  detail={`${cap(t.avond)} · ${t.start}`}
                  onClick={() => router.push(`/standen/${t.id}`)}
                  chevron
                />
              ))}
            </List>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', padding: '8px 0' }}>
              Geen vaste teams op deze locatie.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
