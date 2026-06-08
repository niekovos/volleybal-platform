'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { Segmented } from '@/components/ui/Segmented'
import { Pill } from '@/components/ui/Pill'
import { List } from '@/components/ui/List'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { useData } from '@/lib/data-context'

export default function ProgrammaPage() {
  const { data } = useData()
  const router = useRouter()
  const [filter, setFilter] = useState<'aankomend' | 'uitslagen'>('aankomend')
  const [showFav, setShowFav] = useState(false)
  const [fav, setFav] = useState<string | null>(null)

  useEffect(() => {
    try { setFav(localStorage.getItem('vb_fav')) } catch { /* ignore */ }
  }, [])

  const competitie = Object.values(data.competities)[0]
  let wedstrijden = data.wedstrijden

  if (showFav && fav) wedstrijden = wedstrijden.filter(w => w.thuis_id === fav || w.uit_id === fav)
  const lijst = filter === 'uitslagen'
    ? wedstrijden.filter(w => w.status === 'gespeeld')
    : wedstrijden.filter(w => w.status !== 'gespeeld')

  const favTeam = fav ? data.teams[fav] : null

  return (
    <>
      <MobileHeader
        eyebrow={competitie?.naam || 'Recreatiecompetitie Assen e.o.'}
        title="Programma"
      />
      <div style={{ padding: '14px 18px 4px' }}>
        <Segmented
          value={filter}
          onChange={v => { setFilter(v as typeof filter); setShowFav(false) }}
          options={[{ value: 'aankomend', label: 'Aankomend' }, { value: 'uitslagen', label: 'Uitslagen' }]}
        />
        {favTeam && (
          <div style={{ marginTop: 10 }}>
            <Pill
              active={showFav}
              icon="ster"
              onClick={() => setShowFav(f => !f)}
            >
              Alleen {favTeam.kort}
            </Pill>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px' }}>
        <List>
          {lijst.map(w => (
            <WedstrijdRij
              key={w.id}
              wedstrijd={w}
              teams={data.teams}
              locaties={data.locaties}
              highlightTeam={fav || undefined}
              onClick={() => router.push(`/programma/${w.id}`)}
              showPoule
              pouleName={data.poules[w.poule_id]?.naam}
            />
          ))}
        </List>
        {lijst.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>
            Geen wedstrijden gevonden.
          </div>
        )}
      </div>
    </>
  )
}
