'use client'
import { DataProvider } from '@/lib/data-context'
import { BottomNav } from '@/components/ui/BottomNav'

const TABS = [
  { href: '/standen',  label: 'Standen',  icon: 'standen'  },
  { href: '/programma', label: 'Programma', icon: 'programma' },
  { href: '/mijn-team', label: 'Mijn team', icon: 'ster'     },
]

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
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
