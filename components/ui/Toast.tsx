import { Icon } from './Icon'

interface ToastProps {
  msg: string | null
}

export function Toast({ msg }: ToastProps) {
  if (!msg) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        background: 'var(--ink)',
        color: 'var(--bg)',
        padding: '12px 18px',
        borderRadius: 999,
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        animation: 'vbSlideUp .25s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="check" size={17} color="var(--positive)" />
      {msg}
    </div>
  )
}
