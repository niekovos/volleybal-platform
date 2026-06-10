'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Field, Input } from '@/components/ui/Field'
import type { User } from '@supabase/supabase-js'

type Status =
  | 'loading' | 'no-invite' | 'expired' | 'already-done'
  | 'need-auth' | 'ready' | 'accepting' | 'accepted' | 'declined' | 'error'

type Invite = {
  id: string
  team_id: string
  team_naam: string
  email: string
  type: 'uitnodiging' | 'overdracht'
  expires_at: string
}

export default function UitnodigingPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [invite, setInvite] = useState<Invite | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Auth form
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [naam, setNaam] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authInfo, setAuthInfo] = useState('')

  useEffect(() => {
    const sb = createClient()

    const init = async (currentUser: User | null) => {
      const { data: inv } = await sb
        .from('aanvoerder_uitnodigingen')
        .select('id, team_id, teams(naam), type, status, expires_at, email')
        .eq('token', token)
        .single()

      if (!inv) { setStatus('no-invite'); return }
      if (inv.status === 'geaccepteerd' || inv.status === 'afgewezen') { setStatus('already-done'); return }
      if (new Date(inv.expires_at) < new Date()) { setStatus('expired'); return }

      const teamRecord = inv.teams as unknown as { naam: string } | null
      setInvite({
        id: inv.id,
        team_id: inv.team_id,
        team_naam: teamRecord?.naam ?? inv.team_id,
        email: inv.email,
        type: inv.type,
        expires_at: inv.expires_at,
      })

      setStatus(currentUser ? 'ready' : 'need-auth')
    }

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      init(u)
    })

    sb.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      init(u)
    })

    return () => subscription.unsubscribe()
  }, [token])

  // Core accept/decline logic (shared between auth flow and ready-state buttons)
  const doAccept = async () => {
    setStatus('accepting')
    try {
      const res = await fetch(`/api/uitnodiging/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actie: 'accept' }),
      })
      const json = await res.json().catch(() => ({})) as { error?: string; redirect?: string }
      if (!res.ok) { setErrorMsg(json.error ?? 'Er is iets misgegaan.'); setStatus('error'); return }
      setStatus('accepted')
      setTimeout(() => router.replace(json.redirect ?? '/aanvoerder'), 1500)
    } catch {
      setErrorMsg('Netwerkfout, probeer het opnieuw.')
      setStatus('error')
    }
  }

  const doDecline = async () => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/uitnodiging/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actie: 'decline' }),
      })
      const json = await res.json().catch(() => ({})) as { redirect?: string }
      setStatus('declined')
      setTimeout(() => router.replace(json.redirect ?? '/standen'), 1500)
    } catch {
      setErrorMsg('Netwerkfout, probeer het opnieuw.')
      setStatus('error')
    }
  }

  // Auth: login or register, then auto-accept
  const handleAuth = async () => {
    if (!invite || !wachtwoord) return
    setAuthLoading(true)
    setAuthError('')
    const sb = createClient()

    if (authMode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email: invite.email, password: wachtwoord })
      if (error) {
        setAuthError('Onjuist wachtwoord. Heb je nog geen account? Kies "Nieuw account" hieronder.')
        setAuthLoading(false)
        return
      }
      await doAccept()
    } else {
      const { data, error } = await sb.auth.signUp({
        email: invite.email,
        password: wachtwoord,
        options: {
          data: { naam: naam.trim() || invite.email.split('@')[0] },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      })
      if (error) {
        setAuthError(error.message)
        setAuthLoading(false)
        return
      }
      if (data.session) {
        // Email confirmation disabled in Supabase — immediate session
        await doAccept()
      } else {
        setAuthInfo('Bevestig je e-mailadres via de link in je inbox. Na bevestiging keer je automatisch terug naar deze uitnodiging.')
        setAuthLoading(false)
      }
    }
  }

  const center: React.CSSProperties = {
    minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)', padding: 20,
  }

  if (status === 'loading' || status === 'accepting') {
    return (
      <div style={center}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-3)' }}>
          {status === 'accepting' ? 'Bezig met accepteren…' : 'Uitnodiging laden…'}
        </div>
      </div>
    )
  }

  if (status === 'no-invite') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="settings" size={32} color="var(--warn-ink)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>Uitnodiging niet gevonden</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Deze link is ongeldig of bestaat niet meer.</div>
          <div style={{ marginTop: 20 }}><Button full onClick={() => router.replace('/standen')}>Naar de standen</Button></div>
        </Card>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="klok" size={32} color="var(--warn-ink)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>Uitnodiging verlopen</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Vraag de organisator om een nieuwe uitnodiging.</div>
          <div style={{ marginTop: 20 }}><Button full onClick={() => router.replace('/standen')}>Naar de standen</Button></div>
        </Card>
      </div>
    )
  }

  if (status === 'already-done') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="check" size={32} color="var(--primary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>Al verwerkt</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Deze uitnodiging is al geaccepteerd of afgewezen.</div>
          <div style={{ marginTop: 20 }}><Button full onClick={() => router.replace('/standen')}>Naar de standen</Button></div>
        </Card>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="check" size={32} color="var(--primary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>Welkom als aanvoerder!</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Je wordt doorgestuurd naar je dashboard…</div>
        </Card>
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>Uitnodiging afgewezen</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Je wordt doorgestuurd…</div>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="settings" size={32} color="var(--warn-ink)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>Er is iets misgegaan</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>{errorMsg}</div>
          <div style={{ marginTop: 20 }}><Button full onClick={() => setStatus(user ? 'ready' : 'need-auth')}>Opnieuw proberen</Button></div>
        </Card>
      </div>
    )
  }

  // Not logged in — show inline login / register form
  if (status === 'need-auth') {
    const isOverdracht = invite?.type === 'overdracht'
    return (
      <div style={center}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="team" size={32} color="white" />
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
              {isOverdracht ? 'Aanvoerderschap accepteren' : 'Uitnodiging aanvaarden'}
            </h1>
            <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>
              Je bent uitgenodigd als aanvoerder van <strong>{invite?.team_naam}</strong>
            </p>
          </div>

          <Card pad={24}>
            {/* Mode tabs */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 4, marginBottom: 20 }}>
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setAuthMode(m); setAuthError(''); setAuthInfo('') }}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 'calc(var(--radius) - 2px)', border: 'none',
                    background: authMode === m ? 'var(--surface)' : 'transparent',
                    boxShadow: authMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 700,
                    color: authMode === m ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer',
                  }}
                >
                  {m === 'login' ? 'Inloggen' : 'Nieuw account'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {authMode === 'register' && (
                <Field label="Jouw naam">
                  <Input
                    value={naam}
                    onChange={e => setNaam(e.target.value)}
                    placeholder="Voornaam Achternaam"
                    autoComplete="name"
                  />
                </Field>
              )}

              <Field label="E-mailadres">
                <Input
                  type="email"
                  value={invite?.email ?? ''}
                  readOnly
                  style={{ color: 'var(--ink-3)', cursor: 'default' }}
                />
              </Field>

              <Field label="Wachtwoord">
                <Input
                  type="password"
                  value={wachtwoord}
                  onChange={e => setWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                />
              </Field>

              {authError && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', background: 'var(--warn-soft)', padding: '10px 12px', borderRadius: 'var(--radius)' }}>
                  {authError}
                </div>
              )}
              {authInfo && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'oklch(0.32 0.12 155)', background: 'oklch(0.93 0.07 155)', padding: '10px 12px', borderRadius: 'var(--radius)', fontWeight: 600, lineHeight: 1.5 }}>
                  {authInfo}
                </div>
              )}

              {!authInfo && (
                <Button full disabled={authLoading || !wachtwoord} onClick={handleAuth}>
                  {authLoading
                    ? 'Bezig…'
                    : authMode === 'login'
                      ? 'Inloggen & uitnodiging accepteren'
                      : 'Account aanmaken & uitnodiging accepteren'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // status === 'ready' — user is logged in, show accept/decline
  const isOverdracht = invite?.type === 'overdracht'
  return (
    <div style={center}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Icon name="team" size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
            {isOverdracht ? 'Aanvoerderschap accepteren' : 'Uitnodiging aanvoerder'}
          </h1>
          <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>
            Ingelogd als {user?.email}
          </p>
        </div>

        <Card pad={24}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)', marginBottom: 20, lineHeight: 1.5 }}>
            {isOverdracht
              ? <>Je bent gevraagd om het aanvoerderschap van <strong>{invite?.team_naam}</strong> over te nemen. Als je accepteert, worden alle teamtaken aan jou overgedragen.</>
              : <>Je bent uitgenodigd om aanvoerder te worden van <strong>{invite?.team_naam}</strong>. Als aanvoerder kun je wedstrijdverzoeken indienen en teamgegevens beheren.</>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button full icon="check" onClick={doAccept}>
              {isOverdracht ? 'Aanvoerderschap accepteren' : 'Uitnodiging accepteren'}
            </Button>
            <Button full variant="ghost" onClick={doDecline}>Weigeren</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
