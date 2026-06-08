interface ScoreProps {
  uitslag: [number, number] | null
  big?: boolean
}

export function Score({ uitslag, big = false }: ScoreProps) {
  if (!uitslag) {
    return (
      <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-num)', fontSize: big ? 22 : 15 }}>
        –&nbsp;:&nbsp;–
      </span>
    )
  }
  return (
    <span
      style={{
        fontFamily: 'var(--font-num)',
        fontWeight: 700,
        fontSize: big ? 26 : 16,
        color: 'var(--ink)',
        letterSpacing: big ? 1 : 0,
        whiteSpace: 'nowrap',
      }}
    >
      {uitslag[0]}
      <span style={{ color: 'var(--ink-3)', margin: '0 3px' }}>–</span>
      {uitslag[1]}
    </span>
  )
}
