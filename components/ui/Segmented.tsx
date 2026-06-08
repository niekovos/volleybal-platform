'use client'

interface Option {
  value: string
  label: string
}

interface SegmentedProps {
  options: Option[]
  value: string
  onChange: (v: string) => void
  full?: boolean
}

export function Segmented({ options, value, onChange, full = true }: SegmentedProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'var(--surface-2)',
        width: full ? '100%' : 'fit-content',
      }}
    >
      {options.map(o => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: full ? 1 : undefined,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              background: on ? 'var(--surface)' : 'transparent',
              color: on ? 'var(--ink)' : 'var(--ink-2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all .15s',
              whiteSpace: 'nowrap',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
