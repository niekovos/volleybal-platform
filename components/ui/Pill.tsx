'use client'
import { Icon } from './Icon'

interface PillProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  icon?: string
}

export function Pill({ children, active = false, onClick, icon }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 999,
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? 'var(--primary-ink)' : 'var(--ink-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'all .15s',
      }}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}
