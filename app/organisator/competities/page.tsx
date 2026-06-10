'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { Pill } from '@/components/ui/Pill'
import { Field, Input, Select } from '@/components/ui/Field'
import { useData } from '@/lib/data-context'
import { createClient } from '@/lib/supabase/client'
import { generateSchema } from '@/lib/supabase/schedule'

const COMP_TYPES = { heren: 'Heren', dames: 'Dames', mix: 'Mix' }
const COMP_FORMATS = { enkel: 'Enkel', anderhalf: 'Anderhalf', dubbel: 'Dubbel' }
const DAGEN_SEL = ['maandag','dinsdag','woensdag','donderdag','vrijdag'] as const

function OrgTopbar({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)' }}>{title}</h1>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>{actions}</div>
    </div>
  )
}

export default function CompetitiesPage() {
  const { data, dispatch, refresh, competitiePoules, teamsByPoule } = useData()
  const [selComp, setSelComp] = useState(Object.keys(data.competities)[0] || null)
  const [selPoule, setSelPoule] = useState<string | null>(null)
  const [compModal, setCompModal] = useState(false)
  const [pouleModal, setPouleModal] = useState<{ compId: string } | null>(null)
  const [teamModal, setTeamModal] = useState<{ pouleId?: string; teamId?: string } | null>(null)
  const [inviteModal, setInviteModal] = useState<{ teamId: string; teamNaam: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const comp = selComp ? data.competities[selComp] : null
  const poule = selPoule ? data.poules[selPoule] : null
  const teams = selPoule ? teamsByPoule(selPoule) : []

  // Competitie modal state
  const [cNaam, setCNaam] = useState('')
  const [cType, setCType] = useState<'heren'|'dames'|'mix'>('mix')
  const [cFormat, setCFormat] = useState<'enkel'|'anderhalf'|'dubbel'>('enkel')
  const [cSeizoen, setCSeizoen] = useState('2025–2026')
  const [cStart, setCStart] = useState('2025-09-01')
  const [cEind, setCEind] = useState('2026-06-30')
  const resetComp = () => { setCNaam(''); setCType('mix'); setCFormat('enkel'); setCSeizoen('2025–2026'); setCStart('2025-09-01'); setCEind('2026-06-30') }

  // Poule modal state
  const [pNaam, setPNaam] = useState('')
  const [pNiveau, setPNiveau] = useState('')
  const [pFormat, setPFormat] = useState<'enkel'|'anderhalf'|'dubbel'>('enkel')
  const resetPoule = (defaultFormat: 'enkel'|'anderhalf'|'dubbel' = 'enkel') => {
    setPNaam(''); setPNiveau(''); setPFormat(defaultFormat)
  }

  // Team modal state
  const [tNaam, setTNaam] = useState(''); const [tKort, setTKort] = useState(''); const [tPlaats, setTPlaats] = useState('')
  const [tAdres, setTAdres] = useState(''); const [tPoule, setTPoule] = useState(selPoule || ''); const [tLoc, setTLoc] = useState(Object.keys(data.locaties)[0] || '')
  const [tAvond, setTAvond] = useState<typeof DAGEN_SEL[number]>('dinsdag'); const [tAanv, setTAanv] = useState(''); const [tTel, setTTel] = useState(''); const [tMail, setTMail] = useState('')

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null)

  const openTeamEdit = (teamId: string) => {
    const t = data.teams[teamId]
    if (!t) return
    setTNaam(t.naam); setTKort(t.kort); setTPlaats(t.plaats); setTAdres(t.adres || '')
    setTPoule(t.poule_id); setTLoc(t.locatie_id); setTAvond(t.avond as typeof DAGEN_SEL[number])
    setTAanv(t.aanvoerder.naam); setTTel(t.aanvoerder.tel); setTMail(t.aanvoerder.mail)
    setTeamModal({ teamId })
  }
  const openTeamNew = (pouleId: string) => {
    setTNaam(''); setTKort(''); setTPlaats(''); setTAdres(''); setTPoule(pouleId); setTLoc(Object.keys(data.locaties)[0] || '')
    setTAvond('dinsdag'); setTAanv(''); setTTel(''); setTMail('')
    setTeamModal({ pouleId })
  }

  const saveTeam = () => {
    const teamId = teamModal?.teamId
    const payload = { naam: tNaam, kort: tKort.toUpperCase().slice(0,3), plaats: tPlaats, adres: tAdres, poule_id: tPoule, locatie_id: tLoc, avond: tAvond, aanvoerder: { naam: tAanv, tel: tTel, mail: tMail }, start: '20:00', blokkades: [] as never[] }
    if (teamId) dispatch({ type: 'UPDATE_TEAM', teamId, data: payload, oldPouleId: data.teams[teamId]?.poule_id || tPoule })
    else dispatch({ type: 'CREATE_TEAM', data: payload })
    setTeamModal(null)
  }

  const handleGenerateSchema = async (overschrijven: boolean) => {
    if (!selPoule || !comp || !poule) return
    setGenerating(true)
    setGenMsg(null)
    try {
      if (overschrijven) {
        await createClient().from('wedstrijden').delete().eq('poule_id', selPoule).eq('status', 'gepland')
      }
      const count = await generateSchema(selPoule, teams, poule, comp)
      await refresh()
      setGenMsg({ ok: true, text: `${count} wedstrijden succesvol ingepland.` })
    } catch {
      setGenMsg({ ok: false, text: 'Genereren mislukt. Controleer of alle teams een locatie en speelavond hebben.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteModal || !inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteResult(null)
    try {
      const res = await fetch('/api/uitnodiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), teamId: inviteModal.teamId, type: 'uitnodiging' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setInviteResult({ ok: false, text: json.error ?? 'Versturen mislukt.' })
      } else {
        setInviteResult({
          ok: true,
          text: json.emailSent
            ? `Uitnodiging verstuurd naar ${inviteEmail}.`
            : `Uitnodigingslink aangemaakt. Deel de link hieronder met de aanvoerder.`,
          link: json.inviteUrl,
        })
      }
    } catch {
      setInviteResult({ ok: false, text: 'Netwerkfout. Probeer opnieuw.' })
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <>
      <OrgTopbar
        title="Competities"
        sub="Beheer competities, poules en teams"
        actions={<>
          <Button size="sm" variant="ghost" icon="plus" onClick={() => { resetComp(); setCompModal(true) }}>Competitie</Button>
          <Button size="sm" icon="plus" onClick={() => selPoule ? openTeamNew(selPoule) : null}>Team</Button>
        </>}
      />
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Linkerkolom */}
        <div style={{ width: 250, flexShrink: 0, borderRight: '1px solid var(--line)', padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>Competities</span>
            <button onClick={() => { resetComp(); setCompModal(true) }} style={{ border: 'none', background: 'var(--primary-soft)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={17} color="var(--primary)" />
            </button>
          </div>
          {Object.values(data.competities).map(c => {
            const on = c.id === selComp
            const cPoules = competitiePoules(c.id)
            return (
              <div key={c.id} style={{ marginBottom: 6 }}>
                <button onClick={() => setSelComp(c.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 12px', borderRadius: 'var(--radius)', border: `1px solid ${on ? 'var(--primary)' : 'transparent'}`, background: on ? 'var(--primary-soft)' : 'var(--surface-2)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: on ? 'var(--primary)' : 'var(--ink)', flex: 1 }}>{c.naam}</div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface)', padding: '2px 7px', borderRadius: 6 }}>{COMP_TYPES[c.type]}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{c.seizoen}</div>
                </button>
                {on && (
                  <div style={{ paddingLeft: 12, marginTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>Poules</span>
                      <button onClick={() => { resetPoule(c.format); setPouleModal({ compId: c.id }) }} style={{ border: 'none', background: 'var(--primary-soft)', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="plus" size={14} color="var(--primary)" />
                      </button>
                    </div>
                    {cPoules.map(p => (
                      <button key={p.id} onClick={() => setSelPoule(p.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 3, borderRadius: 'var(--radius)', border: 'none', background: selPoule === p.id ? 'var(--surface)' : 'transparent', cursor: 'pointer', boxShadow: selPoule === p.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: selPoule === p.id ? 700 : 600, color: selPoule === p.id ? 'var(--primary)' : 'var(--ink-2)' }}>{p.naam}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>{COMP_FORMATS[p.format]} · {teamsByPoule(p.id).length} teams</div>
                      </button>
                    ))}
                    {!cPoules.length && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', padding: '4px 10px' }}>Nog geen poules</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hoofdgedeelte */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {poule ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'var(--ink)' }}>{comp?.naam} — {poule.naam}</h2>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>
                    {poule.niveau && `${poule.niveau} · `}{COMP_FORMATS[poule.format]} competitie
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button size="sm" variant="ghost" icon="plus" onClick={() => openTeamNew(selPoule!)}>Team</Button>
                  {(() => {
                    const bestaand = data.wedstrijden.filter(w => w.poule_id === selPoule)
                    const gespeeld = bestaand.filter(w => w.status === 'gespeeld').length
                    const gepland  = bestaand.filter(w => w.status === 'gepland' || w.status === 'verzoek').length
                    if (teams.length < 2) return null
                    if (gespeeld > 0) return (
                      <Button size="sm" variant="ghost" icon="programma" disabled>{bestaand.length} wedstrijden</Button>
                    )
                    if (gepland > 0) return (
                      <Button size="sm" variant="ghost" icon="verplaats" disabled={generating}
                        onClick={() => handleGenerateSchema(true)}>
                        {generating ? 'Bezig…' : 'Opnieuw plannen'}
                      </Button>
                    )
                    return (
                      <Button size="sm" icon="programma" disabled={generating}
                        onClick={() => handleGenerateSchema(false)}>
                        {generating ? 'Bezig…' : 'Schema genereren'}
                      </Button>
                    )
                  })()}
                </div>
              </div>
              {genMsg && (
                <div style={{
                  marginBottom: 14, padding: '10px 14px', borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  background: genMsg.ok ? 'oklch(0.93 0.07 155)' : 'var(--warn-soft)',
                  color:      genMsg.ok ? 'oklch(0.32 0.12 155)' : 'var(--warn-ink)',
                }}>
                  {genMsg.text}
                </div>
              )}
              {teams.length > 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 1fr 76px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
                    <div>Team</div><div>Aanvoerder</div><div>Locatie</div><div>Speelavond</div><div></div>
                  </div>
                  {teams.map((t, i) => (
                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 1fr 76px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < teams.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Monogram kort={t.kort} hue={t.hue} size={32} />
                        <div>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t.naam}</span>
                          {t.adres && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>{t.adres}</div>}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)' }}>{t.aanvoerder.naam || '—'}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>{data.locaties[t.locatie_id]?.naam || '—'}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', textTransform: 'capitalize' }}>{t.avond}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setInviteEmail(''); setInviteResult(null); setInviteModal({ teamId: t.id, teamNaam: t.naam }) }}
                          title="Aanvoerder uitnodigen"
                          style={{ border: 'none', background: 'var(--primary-soft)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Icon name="mail" size={16} color="var(--primary)" />
                        </button>
                        <button onClick={() => openTeamEdit(t.id)} style={{ border: 'none', background: 'var(--surface-2)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="potlood" size={16} color="var(--ink-2)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card pad={40} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', marginBottom: 14 }}>Nog geen teams in deze poule.</div>
                  <Button size="sm" icon="plus" onClick={() => openTeamNew(selPoule!)}>Eerste team toevoegen</Button>
                </Card>
              )}
            </>
          ) : (
            <Card pad={40} style={{ textAlign: 'center' }}>
              <Icon name="trofee" size={30} color="var(--ink-3)" />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', marginTop: 10 }}>Selecteer een competitie en poule.</div>
            </Card>
          )}
        </div>
      </div>

      {/* Competitie modal */}
      <Modal open={compModal} onClose={() => setCompModal(false)} title="Nieuwe competitie" width={500}
        footer={<><Button variant="ghost" onClick={() => setCompModal(false)}>Annuleren</Button><Button icon="check" disabled={!cNaam.trim()} onClick={() => { dispatch({ type: 'CREATE_COMPETITIE', data: { naam: cNaam, type: cType, format: cFormat, seizoen: cSeizoen, startDatum: cStart, eindDatum: cEind } }); setCompModal(false) }}>Aanmaken</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Naam"><Input value={cNaam} onChange={e => setCNaam(e.target.value)} placeholder="Bijv. Heren Competitie" /></Field>
          <Field label="Type"><div style={{ display: 'flex', gap: 8 }}>{(['heren','dames','mix'] as const).map(k => <Pill key={k} active={cType===k} onClick={() => setCType(k)}>{COMP_TYPES[k]}</Pill>)}</div></Field>
          <Field label="Standaard format" hint="Wordt als standaard ingevuld bij nieuwe poules in deze competitie.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(['enkel','anderhalf','dubbel'] as const).map(k => <Pill key={k} active={cFormat===k} onClick={() => setCFormat(k)}>{COMP_FORMATS[k]}</Pill>)}</div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Begindatum"><Input type="date" value={cStart} onChange={e => setCStart(e.target.value)} /></Field>
            <Field label="Einddatum"><Input type="date" value={cEind} onChange={e => setCEind(e.target.value)} /></Field>
          </div>
          <Field label="Seizoen"><Input value={cSeizoen} onChange={e => setCSeizoen(e.target.value)} placeholder="2025–2026" /></Field>
        </div>
      </Modal>

      {/* Poule modal */}
      <Modal open={!!pouleModal} onClose={() => setPouleModal(null)} title="Nieuwe poule" width={440}
        footer={<><Button variant="ghost" onClick={() => setPouleModal(null)}>Annuleren</Button><Button icon="check" disabled={!pNaam.trim()} onClick={() => { if(pouleModal) dispatch({ type: 'CREATE_POULE', competitieId: pouleModal.compId, naam: pNaam, niveau: pNiveau, format: pFormat }); setPouleModal(null) }}>Aanmaken</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Naam"><Input value={pNaam} onChange={e => setPNaam(e.target.value)} placeholder="Bijv. Dames 1e klasse" /></Field>
          <Field label="Niveau / omschrijving"><Input value={pNiveau} onChange={e => setPNiveau(e.target.value)} placeholder="1e klasse" /></Field>
          <Field label="Format" hint="Enkel: 2× per koppel (1 thuis + 1 uit) · Anderhalf: 3× · Dubbel: 4×">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['enkel','anderhalf','dubbel'] as const).map(k => (
                <Pill key={k} active={pFormat===k} onClick={() => setPFormat(k)}>{COMP_FORMATS[k]}</Pill>
              ))}
            </div>
          </Field>
        </div>
      </Modal>

      {/* Team modal */}
      <Modal open={!!teamModal} onClose={() => setTeamModal(null)} title={teamModal?.teamId ? 'Team bewerken' : 'Nieuw team'} width={560}
        footer={<><Button variant="ghost" onClick={() => setTeamModal(null)}>Annuleren</Button><Button icon="check" disabled={!tNaam.trim() || !tKort.trim()} onClick={saveTeam}>{teamModal?.teamId ? 'Opslaan' : 'Aanmaken'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14 }}>
            <Field label="Teamnaam"><Input value={tNaam} onChange={e => setTNaam(e.target.value)} placeholder="Bijv. VV Assen Mix 4" /></Field>
            <Field label="Afkorting"><Input value={tKort} onChange={e => setTKort(e.target.value.slice(0,3))} placeholder="VVA" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Plaats"><Input value={tPlaats} onChange={e => setTPlaats(e.target.value)} /></Field>
            <Field label="Adres"><Input value={tAdres} onChange={e => setTAdres(e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Poule">
              <Select value={tPoule} onChange={e => setTPoule(e.target.value)}>
                {Object.values(data.poules).map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
              </Select>
            </Field>
            <Field label="Thuislocatie">
              <Select value={tLoc} onChange={e => setTLoc(e.target.value)}>
                {Object.values(data.locaties).map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Speelavond">
            <Select value={tAvond} onChange={e => setTAvond(e.target.value as typeof DAGEN_SEL[number])}>
              {DAGEN_SEL.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
            </Select>
          </Field>
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
          <Field label="Aanvoerder naam"><Input value={tAanv} onChange={e => setTAanv(e.target.value)} placeholder="Naam" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Telefoon"><Input value={tTel} onChange={e => setTTel(e.target.value)} placeholder="06 …" /></Field>
            <Field label="E-mail"><Input value={tMail} onChange={e => setTMail(e.target.value)} placeholder="naam@club.nl" /></Field>
          </div>
        </div>
      </Modal>

      {/* Uitnodiging modal */}
      <Modal
        open={!!inviteModal}
        onClose={() => { setInviteModal(null); setInviteResult(null) }}
        title="Aanvoerder uitnodigen"
        width={460}
        footer={
          inviteResult?.ok ? (
            <Button onClick={() => { setInviteModal(null); setInviteResult(null) }}>Sluiten</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setInviteModal(null); setInviteResult(null) }}>Annuleren</Button>
              <Button icon="mail" disabled={inviteLoading || !inviteEmail.trim()} onClick={handleInvite}>
                {inviteLoading ? 'Versturen…' : 'Uitnodiging versturen'}
              </Button>
            </>
          )
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)' }}>
            Stuur een uitnodiging naar de aanvoerder van <strong>{inviteModal?.teamNaam}</strong>.
            De ontvanger kan een account aanmaken en wordt automatisch als aanvoerder van dit team ingesteld.
          </div>
          {!inviteResult && (
            <Field label="E-mailadres aanvoerder">
              <Input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="naam@club.nl"
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
            </Field>
          )}
          {inviteResult && (
            <div style={{
              padding: '12px 14px', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              background: inviteResult.ok ? 'oklch(0.93 0.07 155)' : 'var(--warn-soft)',
              color: inviteResult.ok ? 'oklch(0.32 0.12 155)' : 'var(--warn-ink)',
            }}>
              {inviteResult.text}
            </div>
          )}
          {inviteResult?.link && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Uitnodigingslink</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', wordBreak: 'break-all', border: '1px solid var(--line)' }}>
                  {inviteResult.link}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(inviteResult!.link!)}
                  style={{ flexShrink: 0, border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}
                >
                  Kopiëren
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
