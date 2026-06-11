'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { UitslagVerzoekSheet } from '@/components/captain/UitslagVerzoekSheet'
import { VerplaatsSheet } from '@/components/captain/VerplaatsSheet'
import { TegenvoorstelSheet } from '@/components/captain/TegenvoorstelSheet'
import { BeschikbaarSheet } from '@/components/captain/BeschikbaarSheet'
import { ContactSheet } from '@/components/captain/ContactSheet'
import { useData } from '@/lib/data-context'
import { fmtDag } from '@/lib/utils'
import type { UitslagVerzoek } from '@/lib/types'

type Sheet = 'uitslag' | 'verplaats' | 'beschikbaar' | 'contact' | null
type ToastMsg = string | null

// Urgent notification card (red/orange)
function UrgentCard({ icon, title, children, style }: {
  icon: string; title: string; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={{
      background: 'var(--warn-soft)', border: '2px solid var(--warn)',
      borderRadius: 'var(--radius-lg)', padding: 16, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--warn-ink)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function AanvoerderPage() {
  const router = useRouter()
  const { data, dispatch, profile, wedstrijdenVan, inkomendVerzoeken, standPositie } = useData()
  const teamId = profile?.teamId ?? ''
  const t = data.teams[teamId]
  const [sheet, setSheet] = useState<Sheet>(null)
  const [selectedWedstrijd, setSelectedWedstrijd] = useState<string | undefined>()
  const [toast, setToast] = useState<ToastMsg>(null)
  const [uitslagVerzoekOpen, setUitslagVerzoekOpen] = useState(false)
  const [selectedUitslagVerzoek, setSelectedUitslagVerzoek] = useState<UitslagVerzoek | null>(null)
  const [tegenvoorstelOpen, setTegenvoorstelOpen] = useState(false)
  const [tegenvoorstelWedstrijdId, setTegenvoorstelWedstrijdId] = useState<string | null>(null)

  if (!t) return null

  const mijn = wedstrijdenVan(teamId)
  const komend = mijn.filter(w => w.status === 'gepland' || w.status === 'verzoek')
  const inkomend = inkomendVerzoeken(teamId)
  const pos = t.poule_id ? standPositie(teamId, t.poule_id) : 0
  const standen = t.poule_id ? (data.standen[t.poule_id] || []) : []
  const poule = t.poule_id ? data.poules[t.poule_id] : null

  // Uitslag verzoeken: te bevestigen door mij
  const teBevestigen = data.uitslag_verzoeken.filter(v => v.te_bevestigen_door === teamId && v.status === 'open')
  // Uitslag verzoeken: ingediend door mij, wacht op tegenstander
  const ingediend = data.uitslag_verzoeken.filter(v => v.ingediend_door === teamId && v.status === 'open')

  const urgentCount = inkomend.length + teBevestigen.length

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
  const handleTegenbod = (verzoekId: string, reden: string, datum: string, tijd: string) => {
    dispatch({ type: 'STEL_TEGENBOD_VOOR', verzoekId, doorTeamId: teamId, reden, datum, tijd })
    setTegenvoorstelOpen(false)
    flash('Tegenvoorstel verstuurd')
  }
  const handleUitslag = (wedstrijdId: string, uitslag: [number, number]) => {
    dispatch({ type: 'STEL_UITSLAG_VOOR', wedstrijdId, uitslag, doorTeamId: teamId })
    setSheet(null)
    flash('Uitslag ingediend — tegenstander ontvangt een bevestigingsverzoek')
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
  const handleGoedkeuren = (verzoekId: string) => {
    dispatch({ type: 'KEUR_UITSLAG_GOED', verzoekId })
    flash('Uitslag bevestigd')
  }
  const handleCorrigeren = (verzoekId: string, uitslag: [number, number]) => {
    dispatch({ type: 'CORRIGEER_UITSLAG', verzoekId, uitslag, doorTeamId: teamId })
    flash('Gecorrigeerde uitslag verstuurd')
  }
  const handleAfwijzenUitslag = (verzoekId: string) => {
    dispatch({ type: 'WIJS_UITSLAG_AF', verzoekId })
    flash('Uitslag geëscaleerd naar organisator')
  }

  const acties = [
    { id: 'uitslag' as const,    icon: 'vink',      label: 'Uitslag doorgeven'    },
    { id: 'verplaats' as const,  icon: 'verplaats', label: 'Wedstrijd verplaatsen' },
    { id: 'beschikbaar' as const,icon: 'klok',      label: 'Beschikbaarheid'       },
    { id: 'contact' as const,    icon: 'potlood',   label: 'Teamgegevens'          },
  ]

  const tegenvoorstelWedstrijd = tegenvoorstelWedstrijdId ? data.wedstrijden.find(w => w.id === tegenvoorstelWedstrijdId) ?? null : null
  const tegenvoorstelVerzoek = tegenvoorstelWedstrijd?.verzoek ?? null

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{pos}e</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, opacity: 0.85 }}>stand</div>
              {urgentCount > 0 && (
                <div style={{ background: '#ef4444', color: '#fff', borderRadius: 99, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-num)', fontSize: 12, fontWeight: 800, marginTop: 4 }}>
                  {urgentCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── URGENTE ACTIES (altijd bovenaan) ── */}
        {(inkomend.length > 0 || teBevestigen.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Inkomende verplaatsverzoeken */}
            {inkomend.map(w => {
              const door = data.teams[w.verzoek!.door]
              return (
                <UrgentCard key={w.id} icon="verplaats" title="Verplaatsverzoek ontvangen">
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 6 }}>
                    <strong>{door?.naam}</strong> wil de wedstrijd van <strong>{fmtDag(w.datum)}</strong> verplaatsen naar{' '}
                    <strong>{fmtDag(w.verzoek!.nieuweDatum)}</strong> om {w.verzoek!.nieuweTijd}.
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                    Reden: &ldquo;{w.verzoek!.reden}&rdquo;
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button full icon="check" onClick={() => handleAcceptVerzoek(w.id)}>Goedkeuren</Button>
                    <Button full variant="soft" icon="verplaats" onClick={() => { setTegenvoorstelWedstrijdId(w.id); setTegenvoorstelOpen(true) }}>
                      Tegenvoorstel doen
                    </Button>
                    <Button full variant="ghost" onClick={() => handleAfwijsVerzoek(w.id)}>Afwijzen</Button>
                  </div>
                </UrgentCard>
              )
            })}

            {/* Uitslag te bevestigen */}
            {teBevestigen.map(vz => {
              const w = data.wedstrijden.find(x => x.id === vz.wedstrijd_id)
              const indiener = data.teams[vz.ingediend_door]
              return (
                <UrgentCard key={vz.id} icon="vink" title="Uitslag ter bevestiging">
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 4 }}>
                    <strong>{indiener?.naam}</strong> heeft de uitslag ingediend voor de wedstrijd van{' '}
                    <strong>{w ? fmtDag(w.datum) : '—'}</strong>:
                  </div>
                  <div style={{ fontFamily: 'var(--font-num)', fontSize: 28, fontWeight: 800, color: 'var(--warn-ink)', marginBottom: 12, textAlign: 'center' }}>
                    {vz.uitslag_thuis}–{vz.uitslag_uit}
                  </div>
                  <Button full variant="soft" onClick={() => { setSelectedUitslagVerzoek(vz); setUitslagVerzoekOpen(true) }}>
                    Bekijken en reageren
                  </Button>
                </UrgentCard>
              )
            })}
          </div>
        )}

        {/* Wacht op tegenstander */}
        {ingediend.length > 0 && (
          <div>
            <SectionTitle>Wacht op tegenstander</SectionTitle>
            {ingediend.map(vz => {
              const w = data.wedstrijden.find(x => x.id === vz.wedstrijd_id)
              const tegenstander = w ? data.teams[w.thuis_id === teamId ? w.uit_id : w.thuis_id] : null
              return (
                <Card key={vz.id} pad={14} style={{ marginBottom: 8, background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="klok" size={18} color="var(--ink-3)" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
                        Uitslag ingediend — wacht op {tegenstander?.naam}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
                        {vz.uitslag_thuis}–{vz.uitslag_uit} · {w ? fmtDag(w.datum) : '—'}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Snel regelen */}
        <div>
          <SectionTitle>Snel regelen</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {acties.map(a => (
              <button key={a.id} onClick={() => setSheet(a.id)}
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '16px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <WedstrijdRij wedstrijd={komend[0]} teams={data.teams} locaties={data.locaties} highlightTeam={teamId}
                onClick={() => router.push(`/programma/${komend[0].id}`)} />
            </Card>
          </div>
        )}

        {/* Poulestand */}
        <div>
          <SectionTitle>
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
      <UitslagVerzoekSheet
        open={uitslagVerzoekOpen}
        onClose={() => setUitslagVerzoekOpen(false)}
        verzoek={selectedUitslagVerzoek}
        teams={data.teams}
        poules={data.poules}
        wedstrijden={data.wedstrijden}
        myTeamId={teamId}
        onGoedkeuren={handleGoedkeuren}
        onCorrigeren={handleCorrigeren}
        onAfwijzen={handleAfwijzenUitslag}
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
      <TegenvoorstelSheet
        open={tegenvoorstelOpen}
        onClose={() => setTegenvoorstelOpen(false)}
        verzoek={tegenvoorstelVerzoek ?? null}
        wedstrijd={tegenvoorstelWedstrijd}
        teams={data.teams}
        alleWedstrijden={data.wedstrijden}
        myTeamId={teamId}
        onSubmit={handleTegenbod}
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
