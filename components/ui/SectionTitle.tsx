interface SectionTitleProps {
  children: React.ReactNode
  action?: string
  onAction?: () => void
}

export function SectionTitle({ children, action, onAction }: SectionTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        margin: '0 0 10px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        {children}
      </h3>
      {action && (
        <button
          onClick={onAction}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
