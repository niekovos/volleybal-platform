'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (rol: 'aanvoerder' | 'organisator') => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    if (rol === 'aanvoerder') router.push('/aanvoerder')
    else router.push('/organisator')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="net" size={28} color="var(--primary-ink)" />
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>Volley Assen</h1>
          <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>Inloggen voor aanvoerders &amp; organisatoren</p>
        </div>

        <Card pad={24}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                autoComplete="current-password"
              />
            </Field>
            {error && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warn-ink)', background: 'var(--warn-soft)', padding: '10px 12px', borderRadius: 'var(--radius)' }}>{error}</div>}
            <Button full disabled={loading} onClick={() => handleLogin('aanvoerder')}>
              {loading ? 'Bezig met inloggen…' : 'Inloggen'}
            </Button>
          </div>
        </Card>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 12 }}>
            Demo — direct testen
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => handleLogin('aanvoerder')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="team" size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Aanvoerder (Sanne de Vries)</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)' }}>VV Assen Mix 2 · Poule A</div>
              </div>
            </button>
            <button
              onClick={() => handleLogin('organisator')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'oklch(0.95 0.03 45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="settings" size={20} color="oklch(0.55 0.16 45)" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Organisator (Henk Westerhof)</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)' }}>Recreatiecompetitie Assen e.o.</div>
              </div>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/standen" style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
            ← Standen bekijken zonder account
          </a>
        </div>
      </div>
    </div>
  )
}
