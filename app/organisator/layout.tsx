'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DataProvider } from '@/lib/data-context'
import { Icon } from '@/components/ui/Icon'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/organisator',             label: 'Dashboard',  icon: 'dashboard' },
  { href: '/organisator/competities', label: 'Competities', icon: 'trofee'   },
  { href: '/organisator/teams',       label: 'Teams',      icon: 'groep'     },
  { href: '/organisator/programma',   label: 'Programma',  icon: 'programma' },
  { href: '/organisator/standen',     label: 'Standen',    icon: 'standen'   },
  { href: '/organisator/locaties',    label: 'Locaties',   icon: 'pin'       },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{ width: 236, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="net" size={22} color="var(--primary-ink)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>Volley Assen</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>Beheer</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={22} color="var(--ink-3)" />
          </button>
        )}
      </div>

      <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
        {NAV.map(it => {
          const on = pathname === it.href || (it.href !== '/organisator' && pathname.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '11px 12px', marginBottom: 2,
                borderRadius: 'var(--radius)', textDecoration: 'none',
                background: on ? 'var(--primary-soft)' : 'transparent',
                color: on ? 'var(--primary)' : 'var(--ink-2)',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: on ? 700 : 600,
              }}
            >
              <Icon name={it.icon} size={20} strokeWidth={on ? 2.1 : 1.8} />
              <span>{it.label}</span>
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)' }}>
        <Link
          href="/account"
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 12px',
            borderRadius: 'var(--radius)', textDecoration: 'none',
            color: 'var(--ink-2)', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
          }}
        >
          <Icon name="persoon" size={20} />
          <span>Mijn account</span>
        </Link>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="team" size={18} color="var(--ink-2)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Organisator</div>
        </div>
        <button
          onClick={handleLogout}
          title="Uitloggen"
          style={{
            border: 'none', background: 'var(--surface-2)', width: 32, height: 32,
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon name="uit" size={16} color="var(--ink-3)" />
        </button>
      </div>
    </div>
  )
}

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <DataProvider>
      <div style={{ height: '100dvh', display: 'flex', background: 'var(--bg)' }}>
        {!isMobile && <Sidebar />}

        {isMobile && menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
            />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, display: 'flex', boxShadow: '4px 0 20px rgba(0,0,0,0.12)' }}>
              <Sidebar onClose={() => setMenuOpen(false)} />
            </div>
          </>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'auto' }}>
          {isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', padding: '0 16px', height: 56,
              background: 'var(--surface)', borderBottom: '1px solid var(--line)',
              position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
            }}>
              <button
                onClick={() => setMenuOpen(true)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', marginLeft: -6 }}
              >
                <Icon name="menu" size={24} color="var(--ink)" />
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                Volley Assen
              </div>
              <div style={{ width: 36 }} />
            </div>
          )}
          {children}
        </div>
      </div>
    </DataProvider>
  )
}
