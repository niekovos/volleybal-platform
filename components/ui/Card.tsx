interface CardProps {
  children: React.ReactNode
  pad?: number
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, pad = 16, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        padding: pad,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
