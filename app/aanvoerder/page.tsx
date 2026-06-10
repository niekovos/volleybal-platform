'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { StandenTabel } from '@/components/ui/StandenTabel'
import { WedstrijdRij } from '@/components/ui/WedstrijdRij'
import { Toast } from '@/components/ui/Toast'
import { UitslagSheet } from '@/components/captain/UitslagSheet'
import { VerplaatsSheet } from '@/components/captain/VerplaatsSheet'
import { BeschikbaarSheet } from '@/components/captain/BeschikbaarSheet'
import { ContactSheet } from '@/components/captain/ContactSheet'
import { useData } from '@/lib/data-context'
import { fmtDag } from '@/lib/utils'

type Sheet = 'uitslag' | 'verplaats' | 'beschikbaar' | 'contact' | null
type ToastMsg = string | null

export default function AanvoerderPage() {
  const { data, dispatch, profile, wedstrijdenVan, inkomendVerzoeken, standPositie } = useData()
  const teamId = profile?.teamId ?? ''
  const t = data.teams[teamId]
  const [sheet, setSheet] = useState<Sheet>(null)
  const [selectedWedstrijd, setSelectedWedstrijd] = useState<string | undefined>()
  const [toast, setToast] = useState<ToastMsg>(null)

  if (!t) return null

  const mijn = wedstrijdenVan(teamId)
  const inTeVullen = mijn.filter(w => w.status === 'gespeeld' && !w.uitslag)
  const komend = mijn.filter(w => w.status === 'gepland' || w.status === 'verzoek')
  const inkomend = inkomendVerzoeken(teamId)
  const pos = t.poule_id ? standPositie(teamId, t.poule_id) : 0
  const standen = t.poule_id ? (data.standen[t.poule_id] || []) : []
  const poule = t.poule_id ? data.poules[t.poule_id] : null

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const openUitslag = (wId?: string) => { setSelectedWedstrijd(wId); setSheet('uitslag') }

  const handleAcceptVerzoek = (wId: string) => {
    dispatch({ type: 'ACCEPT_VERZOEK', wedstrijdId: wId })
    flash('Verplaatsverzoek goedgekeurd')
  }
  const handleAfwijsVerzoek = (wId: string) => {
    dispatch({ type: 'AFWIJS_VERZOEK', wedstrijdId: wId })
    flash('Verplaatsverzoek afgewezen')
  }
  const handleUitslag = (wedstrijdId: string, uitslag: [number, number]) => {
    dispatch({ type: 'SET_UITSLAG', wedstrijdId, uitslag })
    setSheet(null)
    flash('Uitslag doorgegeven')
  }
  const handleVerplaats = (wedstrijdId: string, reden: string, datum: string, tijd: string) => {
    const w = data.wedstrijden.find(x => x.id === wedstrijdId)
    const aan = w ? (w.thuis_id === teamId ? w.uit_id : w.thuis_id) : ''
    dispatch({ type: 'CREATE_VERZOEK', wedstrijdId, door: teamId, aan, reden, nieuweDatum: datum, nieuweTijd: tijd })
    setSheet(null)
    flash('Verplaatsverzoek verstuurd')
  }
  const handleBeschikbaar = (speelavonden: { dag: string; tijd: string }[], blokkades: typeof t.blokkades) => {
    dispatch({ type: 'UPDATE_BESCHIKBAARHEID', teamId, speelavonden, blokkades })
    setSheet(null)
    flash('Beschikbaarheid opgeslagen')
  }
  const handleContact = (naam: string, tel: string, mail: string, locatie_id: string) => {
    dispatch({ type: 'UPDATE_TEAMGEGEVENS', teamId, naam, tel, mail, locatie_id })
    setSheet(null)
    flash('Teamgegevens opgeslagen')
  }

  const acties = [
    { id: 'uitslag' as const,    icon: 'vink',     label: 'Uitslag doorgeven'   },
    { id: 'verplaats' as const,  icon: 'verplaats', label: 'Wedstrijd verplaatsen' },
    { id: 'beschikbaar' as const,icon: 'klok',     label: 'Beschikbaarheid'      },
    { id: 'contact' as const,    icon: 'potlood',  label: 'Teamgegevens'          },
  ]

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero */}
      <div style={{ paddingTop: 52, background: 'var(--bg)' }}>
        <div style={{ margin: '4px 14px 0', background: 'var(--primary)', color: 'var(--primary-ink)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Monogram kort={t.kort} hue={t.hue} size={48} ring />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, opacity: 0.85 }}>Aanvoerder · {poule?.naam}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800, letterSpacing: -0.4 }}>{t.naam}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{pos}e</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, opacity: 0.85 }}>stand</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Inkomende verplaatsverzoeken */}
        {inkomend.length > 0 && (
          <div>
            <SectionTitle>Verplaatsverzoek ontvangen</SectionTitle>
            {inkomend.map(w => {
              const door = data.teams[w.verzoek!.door]
              return (
                <Card key={w.id} pad={16} style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Icon name="verplaats" size={20} color="var(--warn-ink)" />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: 'var(--warn-ink)' }}>Verzoek van {door?.naam}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 6 }}>
                    {data.teams[w.thuis_id]?.kort} – {data.teams[w.uit_id]?.kort} · {fmtDag(w.datum)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
                    Reden: &ldquo;{w.verzoek?.reden}&rdquo;
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
                    Voorstel: <strong>{w.verzoek?.nieuweDatum ? fmtDag(w.verzoek.nieuweDatum) : ''}</strong>
                    {w.verzoek?.nieuweTijd ? ` · ${w.verzoek.nieuweTijd}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button full icon="check" onClick={() => handleAcceptVerzoek(w.id)}>Goedkeuren</Button>
                    <Button full variant="ghost" onClick={() => handleAfwijsVerzoek(w.id)}>Afwijzen</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Actie nodig */}
        {inTeVullen.length > 0 && (
          <div>
            <SectionTitle>Actie nodig</SectionTitle>
            {inTeVullen.map(w => (
              <Card key={w.id} pad={16} style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Icon name="alert" size={20} color="var(--warn-ink)" />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: 'var(--warn-ink)' }}>Uitslag nog niet doorgegeven</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Monogram kort={data.teams[w.thuis_id]?.kort} hue={data.teams[w.thuis_id]?.hue} size={30} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{data.teams[w.thuis_id]?.kort}</span>
                  <span style={{ fontFamily: 'var(--font-num)', color: 'var(--ink-3)' }}>vs</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{data.teams[w.uit_id]?.kort}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>{fmtDag(w.datum)}</span>
                </div>
                <Button full onClick={() => openUitslag(w.id)} icon="vink">Uitslag doorgeven</Button>
              </Card>
            ))}
          </div>
        )}

        {/* Snel regelen */}
        <div>
          <SectionTitle>Snel regelen</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {acties.map(a => (
              <button
                key={a.id}
                onClick={() => setSheet(a.id)}
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '16px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={a.icon} size={20} color="var(--primary)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Volgende wedstrijd */}
        {komend[0] && (
          <div>
            <SectionTitle>Volgende wedstrijd</SectionTitle>
            <Card pad={0}>
              <WedstrijdRij wedstrijd={komend[0]} teams={data.teams} locaties={data.locaties} highlightTeam={teamId} />
            </Card>
          </div>
        )}

        {/* Poulestand */}
        <div>
          <SectionTitle action="Volledige stand" onAction={() => {}}>
            <Link href="/aanvoerder/standen" style={{ textDecoration: 'none', color: 'inherit' }}>Onze poule</Link>
          </SectionTitle>
          <StandenTabel standen={standen} teams={data.teams} highlight={teamId} compact />
        </div>
      </div>

      {/* Sheets */}
      <UitslagSheet
        open={sheet === 'uitslag'}
        onClose={() => setSheet(null)}
        wedstrijden={mijn}
        teams={data.teams}
        poules={data.poules}
        teamId={teamId}
        defaultWedstrijdId={selectedWedstrijd}
        onSubmit={handleUitslag}
      />
      <VerplaatsSheet
        open={sheet === 'verplaats'}
        onClose={() => setSheet(null)}
        wedstrijden={mijn}
        alleWedstrijden={data.wedstrijden}
        teams={data.teams}
        teamId={teamId}
        onSubmit={handleVerplaats}
      />
      <BeschikbaarSheet
        open={sheet === 'beschikbaar'}
        onClose={() => setSheet(null)}
        teamSpeelavonden={t.speelavonden}
        teamBlokkades={t.blokkades}
        onSubmit={handleBeschikbaar}
      />
      <ContactSheet
        open={sheet === 'contact'}
        onClose={() => setSheet(null)}
        team={t}
        locaties={data.locaties}
        onSubmit={handleContact}
      />
      <Toast msg={toast} />
    </div>
  )
}
