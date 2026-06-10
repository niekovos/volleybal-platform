'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import type { User } from '@supabase/supabase-js'

type Status = 'loading' | 'no-invite' | 'expired' | 'already-done' | 'ready' | 'accepting' | 'accepted' | 'declined' | 'need-login' | 'error'

type Invite = {
  id: string
  team_id: string
  team_naam: string
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

  useEffect(() => {
    const sb = createClient()

    const init = async (currentUser: User | null) => {
      // Fetch invitation
      const { data: inv } = await sb
        .from('aanvoerder_uitnodigingen')
        .select('id, team_id, teams(naam), type, status, expires_at')
        .eq('token', token)
        .single()

      if (!inv) { setStatus('no-invite'); return }
      if (inv.status === 'geaccepteerd' || inv.status === 'afgewezen') { setStatus('already-done'); return }
      if (new Date(inv.expires_at) < new Date()) { setStatus('expired'); return }

      const teamRecord = inv.teams as unknown as { naam: string } | null
      const teamNaam = teamRecord?.naam ?? inv.team_id
      setInvite({ id: inv.id, team_id: inv.team_id, team_naam: teamNaam, type: inv.type, expires_at: inv.expires_at })

      if (!currentUser) {
        setStatus('need-login')
      } else {
        setStatus('ready')
      }
    }

    // Listen for auth state (handles Supabase invite email redirect with #access_token)
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      init(u)
    })

    // Also get current session immediately
    sb.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      init(u)
    })

    return () => subscription.unsubscribe()
  }, [token])

  const handleAction = async (actie: 'accept' | 'decline') => {
    setStatus(actie === 'accept' ? 'accepting' : 'loading')
    try {
      const res = await fetch(`/api/uitnodiging/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actie }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg((json as { error?: string }).error ?? 'Er is iets misgegaan.')
        setStatus('error')
        return
      }
      setStatus(actie === 'accept' ? 'accepted' : 'declined')
      setTimeout(() => router.replace((json as { redirect?: string }).redirect ?? '/standen'), 1500)
    } catch {
      setErrorMsg('Netwerkfout, probeer het opnieuw.')
      setStatus('error')
    }
  }

  const center: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 20,
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
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>Vraag de organisator of huidige aanvoerder om een nieuwe uitnodiging.</div>
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

  if (status === 'need-login') {
    return (
      <div style={center}>
        <Card pad={32} style={{ maxWidth: 380, textAlign: 'center' }}>
          <Icon name="team" size={32} color="var(--primary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>
            {invite?.type === 'overdracht' ? 'Aanvoerderschap accepteren' : 'Aanvoerder worden'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>
            Je bent uitgenodigd als aanvoerder van <strong>{invite?.team_naam}</strong>.
            Log eerst in of maak een account aan, keer daarna terug naar deze link.
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button full onClick={() => router.push(`/login?return=/uitnodiging/${token}`)}>
              Inloggen of account aanmaken
            </Button>
          </div>
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
          <div style={{ marginTop: 20 }}><Button full onClick={() => setStatus('ready')}>Opnieuw proberen</Button></div>
        </Card>
      </div>
    )
  }

  // status === 'ready'
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
            <Button full icon="check" onClick={() => handleAction('accept')}>
              {isOverdracht ? 'Aanvoerderschap accepteren' : 'Uitnodiging accepteren'}
            </Button>
            <Button full variant="ghost" onClick={() => handleAction('decline')}>
              Weigeren
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
