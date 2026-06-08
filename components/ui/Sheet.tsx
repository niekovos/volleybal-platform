'use client'
import { useEffect } from 'react'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.35)',
        animation: 'vbFade .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: '22px 22px 0 0',
          maxHeight: '92%',
          display: 'flex',
          flexDirection: 'column',
          animation: 'vbSlideUp .26s cubic-bezier(.2,.8,.2,1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px 12px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--surface-2)',
              width: 34,
              height: 34,
              borderRadius: 999,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-2)',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ overflow: 'auto', padding: '0 18px 18px', flex: 1 }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: '14px 18px 28px',
              borderTop: '1px solid var(--line)',
              background: 'var(--surface)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
