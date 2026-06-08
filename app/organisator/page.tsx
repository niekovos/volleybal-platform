'use client'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { Icon } from '@/components/ui/Icon'
import { useData } from '@/lib/data-context'

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
  const { data } = useData()

  const teams = Object.keys(data.teams).length
  const competities = Object.keys(data.competities).length
  const locaties = Object.keys(data.locaties).length
  const gespeeld = data.wedstrijden.filter(w => w.status === 'gespeeld' && w.uitslag).length
  const teVullen = data.wedstrijden.filter(w => w.status === 'gespeeld' && !w.uitslag)
  const recent = data.wedstrijden.filter(w => w.status === 'gespeeld' && w.uitslag).slice(-4).reverse()

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
    </>
  )
}
