'use client'
import { Icon } from './Icon'

interface MobileHeaderProps {
  eyebrow?: string
  title: string
  onBack?: () => void
  right?: React.ReactNode
  sticky?: boolean
}

export function MobileHeader({ eyebrow, title, onBack, right, sticky = true }: MobileHeaderProps) {
  return (
    <div
      style={{
        paddingTop: 52,
        background: 'var(--bg)',
        position: sticky ? 'sticky' : 'static',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ padding: '0 18px 14px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 600,
              padding: '4px 0 8px',
              marginLeft: -4,
            }}
          >
            <Icon name="links" size={20} /> Terug
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {eyebrow && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--ink-3)',
                  marginBottom: 3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {eyebrow}
              </div>
            )}
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: -0.5,
                color: 'var(--ink)',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
          </div>
          {right}
        </div>
      </div>
    </div>
  )
}
