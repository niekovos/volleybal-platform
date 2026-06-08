type Status = 'gespeeld' | 'gepland' | 'verzoek' | 'verplaatst' | 'teVerwerken'

const MAP: Record<Status, { label: string; bg: string; fg: string; soft?: boolean }> = {
  gespeeld:    { label: 'Gespeeld',           bg: 'var(--ink-3)',    fg: '#fff',             soft: true },
  gepland:     { label: 'Gepland',             bg: 'var(--primary-soft)', fg: 'var(--primary)' },
  verzoek:     { label: 'Verplaatsverzoek',    bg: 'var(--warn-soft)', fg: 'var(--warn-ink)' },
  verplaatst:  { label: 'Verplaatst',          bg: 'var(--warn-soft)', fg: 'var(--warn-ink)' },
  teVerwerken: { label: 'In te vullen',        bg: 'var(--warn-soft)', fg: 'var(--warn-ink)' },
}

interface StatusBadgeProps {
  status: string
  small?: boolean
}

export function StatusBadge({ status, small = false }: StatusBadgeProps) {
  const m = MAP[status as Status] || MAP.gepland
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: m.soft ? 'var(--surface-2)' : m.bg,
        color: m.soft ? 'var(--ink-2)' : m.fg,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        padding: small ? '2px 8px' : '4px 10px',
        borderRadius: 999,
        lineHeight: 1.4,
        letterSpacing: 0.1,
        whiteSpace: 'nowrap',
      }}
    >
      {m.label}
    </span>
  )
}
