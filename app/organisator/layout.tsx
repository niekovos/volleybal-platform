'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DataProvider } from '@/lib/data-context'
import { Icon } from '@/components/ui/Icon'

const NAV = [
  { href: '/organisator',            label: 'Dashboard',  icon: 'dashboard' },
  { href: '/organisator/competities', label: 'Competities', icon: 'trofee'   },
  { href: '/organisator/programma',  label: 'Programma',  icon: 'programma' },
  { href: '/organisator/standen',    label: 'Standen',    icon: 'standen'   },
  { href: '/organisator/locaties',   label: 'Locaties',   icon: 'pin'       },
]

function Sidebar() {
  const pathname = usePathname()
  return (
    <div style={{ width: 236, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="net" size={22} color="var(--primary-ink)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>Volley Assen</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>Beheer</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 12, flex: 1 }}>
        {NAV.map(it => {
          const on = pathname === it.href || (it.href !== '/organisator' && pathname.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
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
      <div style={{ padding: 16, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink-2)', flexShrink: 0 }}>HW</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Henk Westerhof</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>Organisator</div>
        </div>
      </div>
    </div>
  )
}

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div style={{ height: '100dvh', display: 'flex', background: 'var(--bg)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </DataProvider>
  )
}
