'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'

type Mode = 'login' | 'signup'

async function redirectAfterLogin(router: ReturnType<typeof useRouter>, returnUrl?: string | null) {
  if (returnUrl) { router.replace(returnUrl); return }
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  const { data: profiel } = await sb
    .from('gebruiker_profielen')
    .select('rol')
    .eq('id', user.id)
    .single()
  if (profiel?.rol === 'organisator') router.replace('/organisator')
  else if (profiel?.rol === 'aanvoerder') router.replace('/aanvoerder')
  else router.replace('/standen')
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('return')
  const [mode, setMode] = useState<Mode>('login')
  const [adminMode, setAdminMode] = useState(false)
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const reset = (nextMode: Mode) => {
    setMode(nextMode)
    setAdminMode(false)
    setError('')
    setInfo('')
  }

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const sb = createClient()
    const { error: authErr } = await sb.auth.signInWithPassword({ email, password })

    if (authErr) {
      setError('E-mailadres of wachtwoord klopt niet.')
      setLoading(false)
      return
    }

    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profiel } = await sb
      .from('gebruiker_profielen')
      .select('rol')
      .eq('id', user.id)
      .single()

    // Profiel aanmaken als het ontbreekt (bijv. na e-mailbevestiging)
    if (!profiel) {
      if (adminMode) {
        setError('Dit account heeft geen beheerdersrechten.')
        await sb.auth.signOut()
        setLoading(false)
        return
      }
      await sb.from('gebruiker_profielen').insert({
        id: user.id,
        naam: user.email?.split('@')[0] ?? 'Gebruiker',
        rol: 'speler',
      })
      router.replace(returnUrl ?? '/standen')
      return
    }

    if (adminMode && profiel.rol !== 'organisator') {
      setError('Dit account heeft geen beheerdersrechten.')
      await sb.auth.signOut()
      setLoading(false)
      return
    }

    await redirectAfterLogin(router, returnUrl)
  }

  const handleSignup = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    setInfo('')

    const sb = createClient()
    const { data, error: authErr } = await sb.auth.signUp({ email, password })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      await sb.from('gebruiker_profielen').insert({
        id: data.user.id,
        naam: naam.trim() || email.split('@')[0],
        rol: 'speler',
      })
      router.replace(returnUrl ?? '/standen')
      return
    }

    // Email confirmation required
    setInfo('Controleer je inbox en klik op de bevestigingslink.')
    setLoading(false)
  }

  const activateAdmin = () => {
    setAdminMode(true)
    setMode('login')
    setError('')
    setInfo('')
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: adminMode ? 'oklch(0.55 0.16 45)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              transition: 'background 0.2s',
            }}
          >
            <Icon name={adminMode ? 'settings' : 'net'} size={32} color="white" />
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--ink)',
            }}
          >
            {adminMode ? 'Beheer inloggen' : 'Volley Assen'}
          </h1>
          <p
            style={{
              margin: '5px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--ink-3)',
            }}
          >
            {adminMode
              ? 'Gebruik je organisator-account'
              : 'Recreatievolleybal Assen e.o.'}
          </p>
        </div>

        {/* Mode tabs (only when not in admin mode) */}
        {!adminMode && (
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius)',
              padding: 4,
              marginBottom: 18,
            }}
          >
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => reset(m)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  border: 'none',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: mode === m ? 'var(--ink)' : 'var(--ink-3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'login' ? 'Inloggen' : 'Registreren'}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <Card pad={24}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && !adminMode && (
              <Field label="Naam">
                <Input
                  value={naam}
                  onChange={e => setNaam(e.target.value)}
                  placeholder="Jouw volledige naam"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="E-mailadres">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                autoComplete="email"
              />
            </Field>
            <Field label="Wachtwoord">
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' || adminMode ? 'current-password' : 'new-password'}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' || adminMode ? handleLogin() : handleSignup())}
              />
            </Field>

            {error && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--warn-ink)',
                  background: 'var(--warn-soft)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                }}
              >
                {error}
              </div>
            )}
            {info && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'oklch(0.32 0.12 155)',
                  background: 'oklch(0.93 0.07 155)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                }}
              >
                {info}
              </div>
            )}

            <Button
              full
              disabled={loading || !email || !password}
              onClick={mode === 'login' || adminMode ? handleLogin : handleSignup}
            >
              {loading
                ? 'Bezig…'
                : adminMode
                  ? 'Inloggen als beheerder'
                  : mode === 'login'
                    ? 'Inloggen'
                    : 'Account aanmaken'}
            </Button>

            {adminMode && (
              <button
                onClick={() => { setAdminMode(false); setError('') }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'center',
                }}
              >
                ← Terug naar normaal inloggen
              </button>
            )}
          </div>
        </Card>

        {/* Footer links */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <a
            href="/standen"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Standen bekijken zonder account →
          </a>

          {!adminMode && (
            <button
              onClick={activateAdmin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--ink-3)',
              }}
            >
              <Icon name="settings" size={15} color="var(--ink-3)" />
              Inloggen als organisator
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
