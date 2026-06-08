'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { Row } from '@/components/ui/Row'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { Input } from '@/components/ui/Field'
import { useData } from '@/lib/data-context'
import { cap } from '@/lib/utils'

export default function MijnTeamPage() {
  const { data, wedstrijdenVan, standPositie } = useData()
  const router = useRouter()
  const [fav, setFav] = useState<string | null>(null)
  const [view, setView] = useState<'main' | 'kies'>('main')
  const [zoek, setZoek] = useState('')

  useEffect(() => {
    try { setFav(localStorage.getItem('vb_fav')) } catch { /* ignore */ }
  }, [])

  const pickFav = (id: string) => {
    try { localStorage.setItem('vb_fav', id) } catch { /* ignore */ }
    setFav(id)
    setView('main')
  }

  const removeFav = () => {
    try { localStorage.removeItem('vb_fav') } catch { /* ignore */ }
    setFav(null)
  }

  if (view === 'kies') {
    const filtered = Object.values(data.teams).filter(t =>
      t.naam.toLowerCase().includes(zoek.toLowerCase()) ||
      t.plaats.toLowerCase().includes(zoek.toLowerCase())
    )
    return (
      <>
        <MobileHeader title="Kies je team" eyebrow="Favoriet" onBack={() => setView('main')} />
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: 13, color: 'var(--ink-3)' }}>
              <Icon name="zoek" size={18} />
            </div>
            <Input
              placeholder="Zoek team of plaats…"
              value={zoek}
              onChange={e => setZoek(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <List>
            {filtered.map(t => (
              <div key={t.id} onClick={() => pickFav(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
                <Monogram kort={t.kort} hue={t.hue} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t.naam}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>{data.poules[t.poule_id]?.naam} · {t.plaats}</div>
                </div>
                <Icon name="plus" size={20} color="var(--primary)" />
              </div>
            ))}
          </List>
        </div>
      </>
    )
  }

  if (!fav) {
    return (
      <>
        <MobileHeader title="Mijn team" eyebrow="Favoriet" />
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card pad={28} style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 999, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="ster" size={28} color="var(--primary)" filled />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Kies je favoriete team</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 18 }}>
              Bewaar je team voor snelle toegang tot stand, programma en aanvoerder-contact.
            </div>
            <Button onClick={() => setView('kies')} icon="ster" full variant="soft">Team kiezen</Button>
          </Card>
        </div>
      </>
    )
  }

  const t = data.teams[fav]
  if (!t) return null
  const l = data.locaties[t.locatie_id]
  const poule = data.poules[t.poule_id]
  const rij = (data.standen[t.poule_id] || []).find(r => r.team_id === fav)
  const pos = standPositie(fav, t.poule_id)
  const wedstrijden = wedstrijdenVan(fav)
  const komend = wedstrijden.filter(w => w.status !== 'gespeeld')

  return (
    <>
      <MobileHeader
        eyebrow={poule?.naam}
        title={t.naam}
        right={
          <button
            onClick={removeFav}
            style={{ border: 'none', background: 'var(--primary)', width: 42, height: 42, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Icon name="ster" size={20} color="var(--primary-ink)" filled />
          </button>
        }
      />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Monogram kort={t.kort} hue={t.hue} size={58} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{t.naam}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>{t.plaats}</div>
            </div>
            {pos > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: 30, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {pos}<span style={{ fontSize: 15, color: 'var(--ink-3)' }}>e</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>in poule</div>
              </div>
            )}
          </div>
          {rij && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {([['Gespeeld', rij.g], ['Gewonnen', rij.w], ['Verloren', rij.v], ['Punten', rij.pnt]] as [string, number][]).map(([k, v]) => (
                <div key={k} style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 4px' }}>
                  <div style={{ fontFamily: 'var(--font-num)', fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{v}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {komend[0] && (
          <div>
            <SectionTitle>Volgende wedstrijd</SectionTitle>
            <Card pad={0}>
              <WedstrijdRij wedstrijd={komend[0]} teams={data.teams} locaties={data.locaties} highlightTeam={fav} onClick={() => router.push(`/programma/${komend[0].id}`)} />
            </Card>
          </div>
        )}

        {l && (
          <div>
            <SectionTitle>Speelavond &amp; locatie</SectionTitle>
            <List>
              <Row icon="klok" title="Vaste speelavond" detail={`${cap(t.avond)} · ${t.start}`} />
              <Row icon="pin" title={l.naam} detail={l.plaats} onClick={() => router.push(`/locatie/${l.id}`)} chevron />
            </List>
          </div>
        )}

        <div>
          <SectionTitle>Contact aanvoerder</SectionTitle>
          <List>
            <Row icon="team" title={t.aanvoerder.naam} detail="Aanvoerder" />
            <Row icon="telefoon" title={t.aanvoerder.tel} href={`tel:${t.aanvoerder.tel}`} chevron />
            <Row icon="mail" title={t.aanvoerder.mail} href={`mailto:${t.aanvoerder.mail}`} chevron />
          </List>
        </div>

        <div>
          <SectionTitle>Wedstrijden</SectionTitle>
          <List>
            {wedstrijden.map(w => (
              <WedstrijdRij key={w.id} wedstrijd={w} teams={data.teams} locaties={data.locaties} highlightTeam={fav} onClick={() => router.push(`/programma/${w.id}`)} />
            ))}
          </List>
        </div>

        <Button variant="ghost" full icon="ster" onClick={() => setView('kies')}>Ander team kiezen</Button>
      </div>
    </>
  )
}
