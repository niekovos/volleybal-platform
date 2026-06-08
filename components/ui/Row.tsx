import { Icon } from './Icon'

interface RowProps {
  icon?: string
  title: string
  detail?: string
  onClick?: () => void
  href?: string
  chevron?: boolean
}

export function Row({ icon, title, detail, onClick, href, chevron }: RowProps) {
  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 16px',
        cursor: onClick || href ? 'pointer' : 'default',
      }}
    >
      {icon && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={18} color="var(--primary)" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      </div>
      {detail && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
          {detail}
        </span>
      )}
      {(chevron || href) && <Icon name="rechts" size={18} color="var(--ink-3)" />}
    </div>
  )
  if (href) return <a href={href} style={{ textDecoration: 'none' }}>{inner}</a>
  return <div onClick={onClick}>{inner}</div>
}
