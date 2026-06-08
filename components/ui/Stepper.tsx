'use client'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

export function Stepper({ value, onChange, min = 0, max = 3 }: StepperProps) {
  const btn = (label: string, fn: () => void) => (
    <button
      onClick={fn}
      style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        color: 'var(--ink)',
        fontSize: 22,
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {btn('−', () => onChange(Math.max(min, value - 1)))}
      <div
        style={{
          fontFamily: 'var(--font-num)',
          fontSize: 30,
          fontWeight: 700,
          color: 'var(--ink)',
          width: 36,
          textAlign: 'center',
        }}
      >
        {value}
      </div>
      {btn('+', () => onChange(Math.min(max, value + 1)))}
    </div>
  )
}
