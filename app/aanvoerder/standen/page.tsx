'use client'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { StandenTabel } from '@/components/ui/StandenTabel'
import { useData } from '@/lib/data-context'
import { DEMO_CAPTAIN_TEAM } from '@/lib/mock-data'

export default function AanvoerderStandenPage() {
  const { data } = useData()
  const t = data.teams[DEMO_CAPTAIN_TEAM]
  const poule = t ? data.poules[t.poule_id] : null
  const standen = t ? (data.standen[t.poule_id] || []) : []

  return (
    <>
      <MobileHeader title="Standen" eyebrow={poule?.naam || ''} />
      <div style={{ padding: 18 }}>
        <StandenTabel standen={standen} teams={data.teams} highlight={DEMO_CAPTAIN_TEAM} compact />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.6 }}>
          G = gespeeld · W = gewonnen · V = verloren · Sets = sets voor–tegen · Pnt = punten (1 per gewonnen set)
        </div>
      </div>
    </>
  )
}
