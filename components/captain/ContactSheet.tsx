'use client'
import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import type { AppData } from '@/lib/types'

interface ContactSheetProps {
  open: boolean
  onClose: () => void
  team: AppData['teams'][string]
  locaties: AppData['locaties']
  onSubmit: (naam: string, tel: string, mail: string, locatie_id: string) => void
}

export function ContactSheet({ open, onClose, team, locaties, onSubmit }: ContactSheetProps) {
  const [naam, setNaam] = useState(team.aanvoerder.naam)
  const [tel, setTel] = useState(team.aanvoerder.tel)
  const [mail, setMail] = useState(team.aanvoerder.mail)
  const [locatie, setLocatie] = useState(team.locatie_id)

  useEffect(() => {
    if (open) { setNaam(team.aanvoerder.naam); setTel(team.aanvoerder.tel); setMail(team.aanvoerder.mail); setLocatie(team.locatie_id) }
  }, [open, team])

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Teamgegevens"
      footer={<Button full icon="check" onClick={() => onSubmit(naam, tel, mail, locatie)}>Opslaan</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Naam aanvoerder"><Input value={naam} onChange={e => setNaam(e.target.value)} /></Field>
        <Field label="Telefoon"><Input value={tel} onChange={e => setTel(e.target.value)} /></Field>
        <Field label="E-mail"><Input value={mail} onChange={e => setMail(e.target.value)} /></Field>
        <Field label="Thuislocatie" hint="Waar spelen jullie je thuiswedstrijden?">
          <Select value={locatie} onChange={e => setLocatie(e.target.value)}>
            {Object.values(locaties).map(l => (
              <option key={l.id} value={l.id}>{l.naam}, {l.plaats}</option>
            ))}
          </Select>
        </Field>
      </div>
    </Sheet>
  )
}
