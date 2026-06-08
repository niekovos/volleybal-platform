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
import { BeschikbaarSheet } from '@/components/captain/BeschikbaarSheet'
import { ContactSheet } from '@/components/captain/ContactSheet'
import { useData } from '@/lib/data-context'
import { DEMO_CAPTAIN_TEAM } from '@/lib/mock-data'
import { cap } from '@/lib/utils'
import type { Dag } from '@/lib/types'

export default function OnsTeamPage() {
  const { data, dispatch } = useData()
  const router = useRouter()
  const teamId = DEMO_CAPTAIN_TEAM
  const t = data.teams[teamId]
  const [beschikbaarOpen, setBeschikbaarOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  if (!t) return null
  const l = data.locaties[t.locatie_id]
  const poule = data.poules[t.poule_id]
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

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
          <SectionTitle action="Wijzigen" onAction={() => setBeschikbaarOpen(true)}>Speelavond &amp; locatie</SectionTitle>
          <List>
            <Row icon="klok" title="Vaste speelavond" detail={`${cap(t.avond)} · ${t.start}`} />
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
        </div>

        {t.blokkades.length > 0 && (
          <div>
            <SectionTitle action="Bewerken" onAction={() => setBeschikbaarOpen(true)}>Blokkeerperiodes</SectionTitle>
            <List>
              {t.blokkades.map(b => <Row key={b.id} icon="programma" title={b.reden} detail={`${b.van} – ${b.tot}`} />)}
            </List>
          </div>
        )}

        <Button variant="ghost" full icon="uit" onClick={() => router.push('/login')}>Uitloggen</Button>
      </div>

      <BeschikbaarSheet
        open={beschikbaarOpen}
        onClose={() => setBeschikbaarOpen(false)}
        teamAvond={t.avond}
        teamStart={t.start}
        teamBlokkades={t.blokkades}
        onSubmit={(avond, start, blokkades) => {
          dispatch({ type: 'UPDATE_BESCHIKBAARHEID', teamId, avond: avond as Dag, start, blokkades })
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
      <Toast msg={toast} />
    </>
  )
}
