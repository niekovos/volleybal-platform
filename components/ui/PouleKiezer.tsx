'use client'
import { Pill } from './Pill'
import type { AppData } from '@/lib/types'

interface PouleKiezerProps {
  poules: AppData['poules']
  value: string
  onChange: (id: string) => void
}

export function PouleKiezer({ poules, value, onChange }: PouleKiezerProps) {
  return (
    <div
      className="hide-scrollbar"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '14px 18px 4px',
      }}
    >
      {Object.values(poules).map(p => (
        <Pill key={p.id} active={p.id === value} onClick={() => onChange(p.id)}>
          {p.naam}
        </Pill>
      ))}
    </div>
  )
}
