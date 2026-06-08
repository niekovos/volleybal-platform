'use client'
import { Icon } from './Icon'

type Variant = 'primary' | 'soft' | 'ghost' | 'danger' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, { pad: string; fs: number; h: number }> = {
  sm: { pad: '8px 14px',  fs: 14, h: 38 },
  md: { pad: '12px 18px', fs: 15, h: 46 },
  lg: { pad: '15px 22px', fs: 16, h: 54 },
}

const VARIANTS: Record<Variant, { bg: string; fg: string; bd: string }> = {
  primary: { bg: 'var(--primary)',      fg: 'var(--primary-ink)', bd: 'transparent' },
  soft:    { bg: 'var(--primary-soft)', fg: 'var(--primary)',     bd: 'transparent' },
  ghost:   { bg: 'transparent',         fg: 'var(--ink)',         bd: 'var(--line)' },
  danger:  { bg: 'var(--warn-soft)',    fg: 'var(--warn-ink)',    bd: 'transparent' },
  quiet:   { bg: 'var(--surface-2)',    fg: 'var(--ink-2)',       bd: 'transparent' },
}

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  icon?: string
  full?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({ children, onClick, variant = 'primary', size = 'md', icon, full = false, disabled = false, type = 'button' }: ButtonProps) {
  const sz = SIZES[size]
  const v = VARIANTS[variant]
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: sz.pad,
        minHeight: sz.h,
        width: full ? '100%' : undefined,
        borderRadius: 'var(--radius)',
        border: `1px solid ${v.bd}`,
        background: v.bg,
        color: v.fg,
        fontFamily: 'var(--font-display)',
        fontSize: sz.fs,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        letterSpacing: 0.1,
        transition: 'filter .15s',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={sz.fs + 3} />}
      {children}
    </button>
  )
}
