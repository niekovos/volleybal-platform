'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from './Icon'

interface Tab {
  href: string
  label: string
  icon: string
  exact?: boolean
}

interface BottomNavProps {
  tabs: Tab[]
}

export function BottomNav({ tabs }: BottomNavProps) {
  const pathname = usePathname()
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid var(--line)',
        background: 'var(--surface)',
        paddingBottom: 22,
        flexShrink: 0,
      }}
    >
      {tabs.map(t => {
        const on = pathname === t.href || (!t.exact && pathname.startsWith(t.href + '/'))
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '10px 4px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: on ? 'var(--primary)' : 'var(--ink-3)',
              textDecoration: 'none',
            }}
          >
            <Icon name={t.icon} size={24} strokeWidth={on ? 2.2 : 1.8} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: on ? 700 : 600 }}>
              {t.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
