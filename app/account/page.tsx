'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'

const ROL_LABEL: Record<string, string> = {
  speler: 'Speler',
  aanvoerder: 'Aanvoerder',
  organisator: 'Organisator',
}

type Profiel = {
  naam: string
  rol: string
  team_id: string | null
}

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [profiel, setProfiel] = useState<Profiel | null>(null)
  const [loading, setLoading] = useState(true)

  const [editNaam, setEditNaam] = useState('')
  const [savingNaam, setSavingNaam] = useState(false)
  const [naamMsg, setNaamMsg] = useState('')

  const [oudWw, setOudWw] = useState('')
  const [nieuwWw, setNieuwWw] = useState('')
  const [savingWw, setSavingWw] = useState(false)
  const [wwMsg, setWwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setEmail(user.email ?? '')
      const { data: p } = await sb.from('gebruiker_profielen').select('naam, rol, team_id').eq('id', user.id).single()
      if (p) { setProfiel(p as Profiel); setEditNaam(p.naam) }
      setLoading(false)
    }
    load()
  }, [router])

  const saveNaam = async () => {
    if (!editNaam.trim()) return
    setSavingNaam(true)
    setNaamMsg('')
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('gebruiker_profielen').update({ naam: editNaam.trim() }).eq('id', user.id)
    setProfiel(prev => prev ? { ...prev, naam: editNaam.trim() } : prev)
    setNaamMsg('Naam opgeslagen.')
    setSavingNaam(false)
    setTimeout(() => setNaamMsg(''), 2000)
  }

  const saveWachtwoord = async () => {
    if (!nieuwWw || nieuwWw.length < 6) {
      setWwMsg({ ok: false, text: 'Wachtwoord moet minimaal 6 tekens zijn.' })
      return
    }
    setSavingWw(true)
    setWwMsg(null)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password: nieuwWw })
    if (error) {
      setWwMsg({ ok: false, text: error.message })
    } else {
      setWwMsg({ ok: true, text: 'Wachtwoord gewijzigd.' })
      setOudWw('')
      setNieuwWw('')
    }
    setSavingWw(false)
  }

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-3)' }}>Laden…</div>
      </div>
    )
  }

  const terugHref = profiel?.rol === 'organisator' ? '/organisator' : profiel?.rol === 'aanvoerder' ? '/aanvoerder' : '/standen'

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: 20 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingTop: 8 }}>
          <button
            onClick={() => router.push(terugHref)}
            style={{ border: 'none', background: 'var(--surface-2)', width: 38, height: 38, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Icon name="links" size={20} color="var(--ink-2)" />
          </button>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Mijn account</h1>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              {email} · <span style={{ fontWeight: 600 }}>{ROL_LABEL[profiel?.rol ?? 'speler'] ?? profiel?.rol}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Naam */}
          <Card pad={20}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Naam</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Weergavenaam">
                <Input value={editNaam} onChange={e => setEditNaam(e.target.value)} placeholder="Jouw naam" />
              </Field>
              {naamMsg && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'oklch(0.32 0.12 155)', fontWeight: 600 }}>{naamMsg}</div>
              )}
              <Button size="sm" icon="check" disabled={savingNaam || !editNaam.trim() || editNaam.trim() === profiel?.naam} onClick={saveNaam}>
                {savingNaam ? 'Opslaan…' : 'Naam opslaan'}
              </Button>
            </div>
          </Card>

          {/* Wachtwoord */}
          <Card pad={20}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Wachtwoord wijzigen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Nieuw wachtwoord">
                <Input
                  type="password"
                  value={nieuwWw}
                  onChange={e => setNieuwWw(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  autoComplete="new-password"
                />
              </Field>
              {wwMsg && (
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  color: wwMsg.ok ? 'oklch(0.32 0.12 155)' : 'var(--warn-ink)',
                }}>
                  {wwMsg.text}
                </div>
              )}
              <Button size="sm" icon="check" disabled={savingWw || nieuwWw.length < 6} onClick={saveWachtwoord}>
                {savingWw ? 'Opslaan…' : 'Wachtwoord wijzigen'}
              </Button>
            </div>
          </Card>

          {/* Uitloggen */}
          <Button variant="ghost" full icon="uit" onClick={handleLogout}>
            Uitloggen
          </Button>
        </div>
      </div>
    </div>
  )
}
