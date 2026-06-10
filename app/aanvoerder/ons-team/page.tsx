'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/ui/MobileHeader'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { List } from '@/components/ui/List'
import { Row } from '@/components/ui/Row'
import { Button } from '@/components/ui/Button'
import { Monogram } from '@/components/ui/Monogram'
import { Toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { BeschikbaarSheet } from '@/components/captain/BeschikbaarSheet'
import { ContactSheet } from '@/components/captain/ContactSheet'
import { useData } from '@/lib/data-context'
import { createClient } from '@/lib/supabase/client'
import { cap } from '@/lib/utils'
import type { Dag } from '@/lib/types'

export default function OnsTeamPage() {
  const { data, dispatch, profile } = useData()
  const router = useRouter()
  const teamId = profile?.teamId ?? null
  const t = teamId ? data.teams[teamId] : null
  const [beschikbaarOpen, setBeschikbaarOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [overdrachtOpen, setOverdrachtOpen] = useState(false)
  const [overdrachtEmail, setOverdrachtEmail] = useState('')
  const [overdrachtLoading, setOverdrachtLoading] = useState(false)
  const [overdrachtResult, setOverdrachtResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  if (!t || !teamId) return (
    <div style={{ padding: 24, fontFamily: 'var(--font-body)', color: 'var(--ink-3)', fontSize: 14 }}>
      Je account is nog niet aan een team gekoppeld.
    </div>
  )

  const l = data.locaties[t.locatie_id]
  const poule = t.poule_id ? data.poules[t.poule_id] : null
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const handleOverdracht = async () => {
    if (!overdrachtEmail.trim()) return
    setOverdrachtLoading(true)
    setOverdrachtResult(null)
    try {
      const res = await fetch('/api/uitnodiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: overdrachtEmail.trim(), teamId, type: 'overdracht' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setOverdrachtResult({ ok: false, text: json.error ?? 'Versturen mislukt.' })
      } else {
        setOverdrachtResult({
          ok: true,
          text: json.emailSent
            ? `Overdrachtverzoek verstuurd naar ${overdrachtEmail}. Zodra de nieuwe aanvoerder accepteert, word je teruggebracht naar speler.`
            : `Overdrachtlink aangemaakt. Deel de link hieronder met de nieuwe aanvoerder.`,
          link: json.inviteUrl,
        })
      }
    } catch {
      setOverdrachtResult({ ok: false, text: 'Netwerkfout. Probeer opnieuw.' })
    } finally {
      setOverdrachtLoading(false)
    }
  }

  return (
    <>
      <MobileHeader
        title="Ons team"
        eyebrow={t.plaats}
        right={<Button size="sm" icon="potlood" variant="soft" onClick={() => setContactOpen(true)}>Bewerken</Button>}
      />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram kort={t.kort} hue={t.hue} size={54} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{t.naam}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>{poule?.naam} · {poule?.niveau}</div>
          </div>
        </Card>

        <div>
          <SectionTitle action="Wijzigen" onAction={() => setBeschikbaarOpen(true)}>Speelavond &amp; training</SectionTitle>
          <List>
            <Row icon="klok" title="Speelavond" detail={`${cap(t.avond)} · ${t.start}`} />
            {t.trainingsAvond && <Row icon="bel" title="Trainingsavond" detail={`${cap(t.trainingsAvond)}${t.trainingsTijd ? ` · ${t.trainingsTijd}` : ''}`} />}
            {l && <Row icon="pin" title={l.naam} detail={l.plaats} />}
          </List>
        </div>

        <div>
          <SectionTitle>Aanvoerder</SectionTitle>
          <List>
            <Row icon="team" title={t.aanvoerder.naam} detail="Aanvoerder" />
            <Row icon="telefoon" title={t.aanvoerder.tel} href={`tel:${t.aanvoerder.tel}`} chevron />
            <Row icon="mail" title={t.aanvoerder.mail} href={`mailto:${t.aanvoerder.mail}`} chevron />
          </List>
          <div style={{ marginTop: 10 }}>
            <Button
              size="sm"
              variant="ghost"
              full
              onClick={() => { setOverdrachtEmail(''); setOverdrachtResult(null); setOverdrachtOpen(true) }}
            >
              Aanvoerderschap overdragen
            </Button>
          </div>
        </div>

        {t.blokkades.length > 0 && (
          <div>
            <SectionTitle action="Bewerken" onAction={() => setBeschikbaarOpen(true)}>Blokkeerperiodes</SectionTitle>
            <List>
              {t.blokkades.map(b => <Row key={b.id} icon="programma" title={b.reden} detail={`${b.van} – ${b.tot}`} />)}
            </List>
          </div>
        )}

        <Button
          variant="ghost"
          full
          icon="uit"
          onClick={async () => {
            await createClient().auth.signOut()
            router.replace('/login')
          }}
        >
          Uitloggen
        </Button>
      </div>

      <BeschikbaarSheet
        open={beschikbaarOpen}
        onClose={() => setBeschikbaarOpen(false)}
        teamAvond={t.avond}
        teamStart={t.start}
        teamBlokkades={t.blokkades}
        teamTrainingsAvond={t.trainingsAvond}
        teamTrainingsTijd={t.trainingsTijd}
        onSubmit={(avond, start, blokkades, trainingsAvond, trainingsTijd) => {
          dispatch({ type: 'UPDATE_BESCHIKBAARHEID', teamId, avond: avond as Dag, start, blokkades, trainingsAvond, trainingsTijd })
          setBeschikbaarOpen(false)
          flash('Beschikbaarheid opgeslagen')
        }}
      />
      <ContactSheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        team={t}
        locaties={data.locaties}
        onSubmit={(naam, tel, mail, locatie_id) => {
          dispatch({ type: 'UPDATE_TEAMGEGEVENS', teamId, naam, tel, mail, locatie_id })
          setContactOpen(false)
          flash('Teamgegevens opgeslagen')
        }}
      />

      {/* Overdracht modal */}
      <Modal
        open={overdrachtOpen}
        onClose={() => setOverdrachtOpen(false)}
        title="Aanvoerderschap overdragen"
        width={440}
        footer={
          overdrachtResult?.ok ? (
            <Button onClick={() => setOverdrachtOpen(false)}>Sluiten</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOverdrachtOpen(false)}>Annuleren</Button>
              <Button icon="mail" disabled={overdrachtLoading || !overdrachtEmail.trim()} onClick={handleOverdracht}>
                {overdrachtLoading ? 'Versturen…' : 'Verzoek versturen'}
              </Button>
            </>
          )
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)' }}>
            De nieuwe aanvoerder ontvangt een e-mail met een acceptatielink.
            Zodra zij accepteren, worden zij aanvoerder van <strong>{t.naam}</strong> en wordt jouw rol teruggezet naar speler.
          </div>
          {!overdrachtResult && (
            <Field label="E-mailadres nieuwe aanvoerder">
              <Input
                type="email"
                value={overdrachtEmail}
                onChange={e => setOverdrachtEmail(e.target.value)}
                placeholder="naam@club.nl"
                onKeyDown={e => e.key === 'Enter' && handleOverdracht()}
              />
            </Field>
          )}
          {overdrachtResult && (
            <div style={{
              padding: '12px 14px', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              background: overdrachtResult.ok ? 'oklch(0.93 0.07 155)' : 'var(--warn-soft)',
              color: overdrachtResult.ok ? 'oklch(0.32 0.12 155)' : 'var(--warn-ink)',
            }}>
              {overdrachtResult.text}
            </div>
          )}
          {overdrachtResult?.link && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Overdrachtlink</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', wordBreak: 'break-all', border: '1px solid var(--line)' }}>
                  {overdrachtResult.link}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(overdrachtResult!.link!)}
                  style={{ flexShrink: 0, border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}
                >
                  Kopiëren
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Toast msg={toast} />
    </>
  )
}
