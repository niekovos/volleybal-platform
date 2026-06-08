interface MapPlaceholderProps {
  label?: string
  height?: number
}

export function MapPlaceholder({ label = 'kaart', height = 120 }: MapPlaceholderProps) {
  return (
    <div
      style={{
        height,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        position: 'relative',
        background: 'repeating-linear-gradient(45deg, var(--surface-2), var(--surface-2) 10px, var(--surface) 10px, var(--surface) 20px)',
        border: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-num)',
          fontSize: 12,
          color: 'var(--ink-3)',
          background: 'var(--surface)',
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--line)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
