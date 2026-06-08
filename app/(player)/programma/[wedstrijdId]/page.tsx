'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Score } from '@/components/ui/Score'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { MapPlaceholder } from '@/components/ui/MapPlaceholder'
import { useData } from '@/lib/data-context'
import { fmtDag } from '@/lib/utils'

export default function WedstrijdDetailPage({ params }: { params: Promise<{ wedstrijdId: string }> }) {
  const { wedstrijdId } = use(params)
  const { data } = useData()
  const router = useRouter()

  const w = data.wedstrijden.find(x => x.id === wedstrijdId)
  if (!w) return <div style={{ padding: 18, color: 'var(--ink-3)' }}>Wedstrijd niet gevonden.</div>

  const th = data.teams[w.thuis_id]
  const ui = data.teams[w.uit_id]
  const l = data.locaties[w.locatie_id]
  const poule = data.poules[w.poule_id]

  return (
    <>
      <MobileHeader eyebrow={poule?.naam} title="Wedstrijd" onBack={() => router.back()} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
              {fmtDag(w.datum)} · {w.tijd}
            </span>
            <StatusBadge status={w.status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => router.push(`/standen/${w.thuis_id}`)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              {th && <Monogram kort={th.kort} hue={th.hue} size={56} />}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{th?.naam}</span>
            </button>
            <div style={{ textAlign: 'center' }}>
              {w.status === 'gespeeld'
                ? <><Score uitslag={w.uitslag} big /><div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>sets</div></>
                : <span style={{ fontFamily: 'var(--font-num)', fontSize: 18, color: 'var(--ink-3)' }}>vs</span>}
            </div>
            <button
              onClick={() => router.push(`/standen/${w.uit_id}`)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              {ui && <Monogram kort={ui.kort} hue={ui.hue} size={56} />}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{ui?.naam}</span>
            </button>
          </div>
        </Card>

        {w.status === 'verzoek' && w.verzoek && (
          <Card pad={16} style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Icon name="verplaats" size={20} color="var(--warn-ink)" />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--warn-ink)', marginBottom: 3 }}>Verplaatsverzoek</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {data.teams[w.verzoek.door]?.naam} vraagt om te verplaatsen: &ldquo;{w.verzoek.reden}&rdquo;. Voorstel:{' '}
                  <strong>{fmtDag(w.verzoek.nieuweDatum)}</strong> om {w.verzoek.nieuweTijd}.
                </div>
              </div>
            </div>
          </Card>
        )}

        {l && (
          <div>
            <SectionTitle>Locatie</SectionTitle>
            <Card pad={0} onClick={() => router.push(`/locatie/${l.id}`)} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <MapPlaceholder label={l.naam} height={120} />
              <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{l.naam}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{l.adres}</div>
                </div>
                <Icon name="rechts" size={20} color="var(--ink-3)" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
