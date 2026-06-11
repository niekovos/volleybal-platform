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

function ContactRegel({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink-2)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '4px 0' }}
    >
      <Icon name={icon} size={16} color="var(--ink-3)" />
      <span>{label}</span>
    </a>
  )
}

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

  const mapsUrl = l
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.naam} ${l.adres} ${l.plaats}`)}`
    : null

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

        {/* Aanvoerders */}
        {(th || ui) && (
          <div>
            <SectionTitle>Aanvoerders</SectionTitle>
            <Card pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[{ team: th, label: 'Thuis' }, { team: ui, label: 'Uit' }].map(({ team, label }) => {
                  if (!team) return null
                  const { naam, tel, mail } = team.aanvoerder
                  return (
                    <div key={team.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Monogram kort={team.kort} hue={team.hue} size={28} />
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{team.naam}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>{label}</div>
                        </div>
                      </div>
                      {naam && (
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', paddingLeft: 36, marginBottom: 4 }}>{naam}</div>
                      )}
                      <div style={{ paddingLeft: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tel && <ContactRegel icon="telefoon" label={tel} href={`tel:${tel.replace(/\s/g, '')}`} />}
                        {mail && <ContactRegel icon="mail" label={mail} href={`mailto:${mail}`} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Locatie */}
        {l && (
          <div>
            <SectionTitle>Locatie</SectionTitle>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                  <MapPlaceholder label={l.naam} height={120} />
                  <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{l.naam}</div>
                      {l.adres && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{l.adres}</div>}
                      {l.plaats && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>{l.plaats}</div>}
                    </div>
                    <Icon name="rechts" size={20} color="var(--ink-3)" />
                  </div>
                </a>
              ) : (
                <>
                  <MapPlaceholder label={l.naam} height={120} />
                  <div style={{ padding: 16 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{l.naam}</div>
                    {l.adres && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{l.adres}</div>}
                    {l.plaats && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>{l.plaats}</div>}
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
