'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { PouleKiezer } from '@/components/ui/PouleKiezer'
import { StandenTabel } from '@/components/ui/StandenTabel'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useData } from '@/lib/data-context'

export default function StandenPage() {
  const { data } = useData()
  const [poule, setPoule] = useState('A')
  const [fav, setFav] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try { setFav(localStorage.getItem('vb_fav')) } catch { /* ignore */ }
  }, [])

  const standen = data.standen[poule] || []
  const pouleObj = data.poules[poule]
  const competitie = pouleObj ? data.competities[pouleObj.competitie_id] : null

  return (
    <>
      <MobileHeader
        eyebrow={competitie?.seizoen || 'Seizoen 2025–2026'}
        title="Standen"
      />
      <PouleKiezer poules={data.poules} value={poule} onChange={setPoule} />
      <div style={{ padding: '8px 18px 24px' }}>
        {pouleObj && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', margin: '4px 2px 12px' }}>
            {pouleObj.niveau}
          </div>
        )}
        {standen.length > 0 ? (
          <StandenTabel
            standen={standen}
            teams={data.teams}
            highlight={fav || undefined}
            onTeam={id => router.push(`/standen/${id}`)}
            compact
          />
        ) : (
          <Card pad={28} style={{ textAlign: 'center' }}>
            <Icon name="net" size={30} color="var(--ink-3)" />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
              Deze poule is nog niet gestart.
            </div>
          </Card>
        )}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.6 }}>
          G = gespeeld · W = gewonnen · V = verloren · Sets = sets voor–tegen · Pnt = punten (1 per gewonnen set)
        </div>
      </div>
    </>
  )
}
