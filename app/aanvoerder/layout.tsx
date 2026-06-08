'use client'
import { DataProvider } from '@/lib/data-context'
import { BottomNav } from '@/components/ui/BottomNav'

const TABS = [
  { href: '/aanvoerder',           label: 'Start',    icon: 'dashboard', exact: true },
  { href: '/aanvoerder/programma', label: 'Programma', icon: 'programma' },
  { href: '/aanvoerder/standen',   label: 'Standen',   icon: 'standen'   },
  { href: '/aanvoerder/ons-team',  label: 'Ons team',  icon: 'team'      },
]

export default function AanvoerderLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
        <BottomNav tabs={TABS} />
      </div>
    </DataProvider>
  )
}
