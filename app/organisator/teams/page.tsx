'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icon'
import { Monogram } from '@/components/ui/Monogram'
import { Pill } from '@/components/ui/Pill'
import { Field, Input, Select } from '@/components/ui/Field'
import { useData } from '@/lib/data-context'
import { createClient } from '@/lib/supabase/client'
import type { GebruikerProfiel } from '@/lib/types'
import { cap } from '@/lib/utils'

const DAGEN_SEL = ['maandag','dinsdag','woensdag','donderdag','vrijdag'] as const
const ROL_LABEL = { speler: 'Speler', aanvoerder: 'Aanvoerder', organisator: 'Organisator' }

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

export default function TeamsPage() {
  const { data, dispatch, refresh } = useData()
  const [tab, setTab] = useState<'teams' | 'gebruikers'>('teams')

  // Team modal
  const [teamModal, setTeamModal] = useState<{ teamId?: string } | null>(null)
  const [tNaam, setTNaam] = useState('')
  const [tKort, setTKort] = useState('')
  const [tPlaats, setTPlaats] = useState('')
  const [tAdres, setTAdres] = useState('')
  const [tPoule, setTPoule] = useState('')
  const [tLoc, setTLoc] = useState('')
  const [tAvond, setTAvond] = useState<typeof DAGEN_SEL[number]>('dinsdag')
  const [tAanv, setTAanv] = useState('')
  const [tTel, setTTel] = useState('')
  const [tMail, setTMail] = useState('')

  // Delete confirmation
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)

  // Invite modal
  const [inviteModal, setInviteModal] = useState<{ teamId: string; teamNaam: string } | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null)

  // Users tab
  const [gebruikers, setGebruikers] = useState<GebruikerProfiel[]>([])
  const [gebruikersLoading, setGebruikersLoading] = useState(false)
  const [rolModal, setRolModal] = useState<{ profiel: GebruikerProfiel } | null>(null)
  const [rolNieuw, setRolNieuw] = useState<'speler' | 'aanvoerder' | 'organisator'>('speler')
  const [rolTeam, setRolTeam] = useState('')
  const [rolSaving, setRolSaving] = useState(false)

  const loadGebruikers = useCallback(async () => {
    setGebruikersLoading(true)
    const sb = createClient()
    const { data: profielen } = await sb
      .from('gebruiker_profielen')
      .select('id, naam, rol, team_id')
      .order('naam')
    setGebruikers((profielen ?? []) as GebruikerProfiel[])
    setGebruikersLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'gebruikers') loadGebruikers()
  }, [tab, loadGebruikers])

  const openTeamNew = () => {
    setTNaam(''); setTKort(''); setTPlaats(''); setTAdres('')
    setTPoule(''); setTLoc(Object.keys(data.locaties)[0] || '')
    setTAvond('dinsdag'); setTAanv(''); setTTel(''); setTMail('')
    setTeamModal({})
  }

  const openTeamEdit = (teamId: string) => {
    const t = data.teams[teamId]
    if (!t) return
    setTNaam(t.naam); setTKort(t.kort); setTPlaats(t.plaats); setTAdres(t.adres || '')
    setTPoule(t.poule_id || ''); setTLoc(t.locatie_id); setTAvond(t.avond as typeof DAGEN_SEL[number])
    setTAanv(t.aanvoerder.naam); setTTel(t.aanvoerder.tel); setTMail(t.aanvoerder.mail)
    setTeamModal({ teamId })
  }

  const saveTeam = () => {
    const teamId = teamModal?.teamId
    const payload = {
      naam: tNaam, kort: tKort.toUpperCase().slice(0, 3), plaats: tPlaats, adres: tAdres,
      poule_id: tPoule || null, locatie_id: tLoc, avond: tAvond,
      aanvoerder: { naam: tAanv, tel: tTel, mail: tMail }, start: '20:00', blokkades: [] as never[],
    }
    if (teamId) {
      dispatch({ type: 'UPDATE_TEAM', teamId, data: payload, oldPouleId: data.teams[teamId]?.poule_id ?? null })
    } else {
      dispatch({ type: 'CREATE_TEAM', data: payload })
    }
    setTeamModal(null)
  }

  const handleDelete = () => {
    if (!deleteTeamId) return
    dispatch({ type: 'DELETE_TEAM', teamId: deleteTeamId })
    setDeleteTeamId(null)
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
          text: json.emailSent ? `Uitnodiging verstuurd naar ${inviteEmail}.` : 'Uitnodigingslink aangemaakt.',
          link: json.inviteUrl,
        })
      }
    } catch {
      setInviteResult({ ok: false, text: 'Netwerkfout. Probeer opnieuw.' })
    } finally {
      setInviteLoading(false)
    }
  }

  const openRolModal = (profiel: GebruikerProfiel) => {
    setRolNieuw(profiel.rol)
    setRolTeam(profiel.team_id || '')
    setRolModal({ profiel })
  }

  const saveRol = async () => {
    if (!rolModal) return
    setRolSaving(true)
    const sb = createClient()
    await sb.from('gebruiker_profielen').update({
      rol: rolNieuw,
      team_id: rolNieuw === 'aanvoerder' ? (rolTeam || null) : null,
    }).eq('id', rolModal.profiel.id)
    setRolModal(null)
    setRolSaving(false)
    await loadGebruikers()
    refresh()
  }

  const allTeams = Object.values(data.teams)

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '9px 18px',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    background: 'none',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: active ? 700 : 600,
    color: active ? 'var(--primary)' : 'var(--ink-3)',
    cursor: 'pointer',
  })

  return (
    <>
      <OrgTopbar
        title="Teams"
        sub="Overzicht van alle teams en gebruikers"
        actions={tab === 'teams' ? <Button size="sm" icon="plus" onClick={openTeamNew}>Nieuw team</Button> : undefined}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '0 24px', background: 'var(--bg)', flexShrink: 0 }}>
        <button style={tabStyle(tab === 'teams')} onClick={() => setTab('teams')}>Teams</button>
        <button style={tabStyle(tab === 'gebruikers')} onClick={() => setTab('gebruikers')}>Gebruikers</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {tab === 'teams' && (
          <>
            {allTeams.length === 0 ? (
              <Card pad={40} style={{ textAlign: 'center' }}>
                <Icon name="groep" size={30} color="var(--ink-3)" />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', marginTop: 10, marginBottom: 14 }}>
                  Nog geen teams aangemaakt.
                </div>
                <Button size="sm" icon="plus" onClick={openTeamNew}>Eerste team aanmaken</Button>
              </Card>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 1fr 100px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
                  <div>Team</div><div>Poule</div><div>Locatie</div><div>Avond</div><div></div>
                </div>
                {allTeams.map((t, i) => {
                  const poule = t.poule_id ? data.poules[t.poule_id] : null
                  return (
                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 1fr 100px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < allTeams.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Monogram kort={t.kort} hue={t.hue} size={32} />
                        <div>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t.naam}</span>
                          {t.aanvoerder.naam && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--ink-3)' }}>{t.aanvoerder.naam}</div>}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>{poule?.naam ?? <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Niet ingedeeld</span>}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>{data.locaties[t.locatie_id]?.naam ?? '—'}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', textTransform: 'capitalize' }}>{t.avond}</div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => { setInviteEmail(''); setInviteResult(null); setInviteModal({ teamId: t.id, teamNaam: t.naam }) }} title="Aanvoerder uitnodigen" style={{ border: 'none', background: 'var(--primary-soft)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="mail" size={15} color="var(--primary)" />
                        </button>
                        <button onClick={() => openTeamEdit(t.id)} title="Bewerken" style={{ border: 'none', background: 'var(--surface-2)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="potlood" size={15} color="var(--ink-2)" />
                        </button>
                        <button onClick={() => setDeleteTeamId(t.id)} title="Verwijderen" style={{ border: 'none', background: 'var(--warn-soft)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="prullenbak" size={15} color="var(--warn-ink)" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'gebruikers' && (
          <>
            {gebruikersLoading ? (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', textAlign: 'center', padding: 40 }}>Laden…</div>
            ) : gebruikers.length === 0 ? (
              <Card pad={40} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>Geen gebruikers gevonden.</div>
              </Card>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 80px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-3)' }}>
                  <div>Naam</div><div>Rol</div><div>Team</div><div></div>
                </div>
                {gebruikers.map((g, i) => {
                  const team = g.team_id ? data.teams[g.team_id] : null
                  return (
                    <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 80px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < gebruikers.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{g.naam}</div>
                      <div>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: g.rol === 'organisator' ? 'oklch(0.93 0.07 45)' : g.rol === 'aanvoerder' ? 'var(--primary-soft)' : 'var(--surface-2)',
                          color: g.rol === 'organisator' ? 'oklch(0.40 0.14 45)' : g.rol === 'aanvoerder' ? 'var(--primary)' : 'var(--ink-3)',
                        }}>
                          {ROL_LABEL[g.rol]}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>{team?.naam ?? '—'}</div>
                      <div>
                        <button onClick={() => openRolModal(g)} style={{ border: 'none', background: 'var(--surface-2)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="potlood" size={15} color="var(--ink-2)" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Team modal */}
      <Modal open={!!teamModal} onClose={() => setTeamModal(null)} title={teamModal?.teamId ? 'Team bewerken' : 'Nieuw team'} width={560}
        footer={<><Button variant="ghost" onClick={() => setTeamModal(null)}>Annuleren</Button><Button icon="check" disabled={!tNaam.trim() || !tKort.trim()} onClick={saveTeam}>{teamModal?.teamId ? 'Opslaan' : 'Aanmaken'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14 }}>
            <Field label="Teamnaam"><Input value={tNaam} onChange={e => setTNaam(e.target.value)} placeholder="Bijv. VV Assen Mix 4" /></Field>
            <Field label="Afkorting"><Input value={tKort} onChange={e => setTKort(e.target.value.slice(0, 3))} placeholder="VVA" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Plaats"><Input value={tPlaats} onChange={e => setTPlaats(e.target.value)} /></Field>
            <Field label="Adres"><Input value={tAdres} onChange={e => setTAdres(e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Poule (optioneel)">
              <Select value={tPoule} onChange={e => setTPoule(e.target.value)}>
                <option value="">— Niet ingedeeld —</option>
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
              {DAGEN_SEL.map(d => <option key={d} value={d}>{cap(d)}</option>)}
            </Select>
          </Field>
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
          <Field label="Aanvoerder naam"><Input value={tAanv} onChange={e => setTAanv(e.target.value)} placeholder="Naam aanvoerder" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Telefoon"><Input value={tTel} onChange={e => setTTel(e.target.value)} placeholder="06 …" /></Field>
            <Field label="E-mail"><Input value={tMail} onChange={e => setTMail(e.target.value)} placeholder="naam@club.nl" /></Field>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTeamId} onClose={() => setDeleteTeamId(null)} title="Team verwijderen" width={400}
        footer={<><Button variant="ghost" onClick={() => setDeleteTeamId(null)}>Annuleren</Button><Button variant="danger" onClick={handleDelete}>Verwijderen</Button></>}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          Weet je zeker dat je <strong>{deleteTeamId ? data.teams[deleteTeamId]?.naam : ''}</strong> wilt verwijderen?
          Alle bijbehorende wedstrijden en standen worden ook verwijderd.
        </div>
      </Modal>

      {/* Invite modal */}
      <Modal open={!!inviteModal} onClose={() => { setInviteModal(null); setInviteResult(null) }} title="Aanvoerder uitnodigen" width={460}
        footer={inviteResult?.ok ? (
          <Button onClick={() => { setInviteModal(null); setInviteResult(null) }}>Sluiten</Button>
        ) : (
          <><Button variant="ghost" onClick={() => { setInviteModal(null); setInviteResult(null) }}>Annuleren</Button>
          <Button icon="mail" disabled={inviteLoading || !inviteEmail.trim()} onClick={handleInvite}>{inviteLoading ? 'Versturen…' : 'Uitnodiging versturen'}</Button></>
        )}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)' }}>
            Stuur een uitnodiging naar de aanvoerder van <strong>{inviteModal?.teamNaam}</strong>.
          </div>
          {!inviteResult && (
            <Field label="E-mailadres aanvoerder">
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="naam@club.nl" onKeyDown={e => e.key === 'Enter' && handleInvite()} />
            </Field>
          )}
          {inviteResult && (
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, background: inviteResult.ok ? 'oklch(0.93 0.07 155)' : 'var(--warn-soft)', color: inviteResult.ok ? 'oklch(0.32 0.12 155)' : 'var(--warn-ink)' }}>
              {inviteResult.text}
            </div>
          )}
          {inviteResult?.link && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', wordBreak: 'break-all', border: '1px solid var(--line)' }}>{inviteResult.link}</div>
              <button onClick={() => navigator.clipboard.writeText(inviteResult!.link!)} style={{ flexShrink: 0, border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)' }}>Kopiëren</button>
            </div>
          )}
        </div>
      </Modal>

      {/* Role edit modal */}
      <Modal open={!!rolModal} onClose={() => setRolModal(null)} title="Rol wijzigen" width={420}
        footer={<><Button variant="ghost" onClick={() => setRolModal(null)}>Annuleren</Button><Button icon="check" disabled={rolSaving} onClick={saveRol}>{rolSaving ? 'Opslaan…' : 'Opslaan'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)' }}>
            Gebruiker: <strong>{rolModal?.profiel.naam}</strong>
          </div>
          <Field label="Rol">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['speler', 'aanvoerder', 'organisator'] as const).map(r => (
                <Pill key={r} active={rolNieuw === r} onClick={() => setRolNieuw(r)}>{ROL_LABEL[r]}</Pill>
              ))}
            </div>
          </Field>
          {rolNieuw === 'aanvoerder' && (
            <Field label="Team">
              <Select value={rolTeam} onChange={e => setRolTeam(e.target.value)}>
                <option value="">— Geen team —</option>
                {Object.values(data.teams).map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Modal>
    </>
  )
}
