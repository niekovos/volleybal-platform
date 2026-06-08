import { monogramKleur } from '@/lib/utils'

interface MonogramProps {
  naam?: string
  kort?: string
  hue?: number
  size?: number
  ring?: boolean
}

export function Monogram({ naam, kort, hue = 240, size = 40, ring = false }: MonogramProps) {
  const bg = monogramKleur(hue)
  const letters = kort || (naam ? naam.slice(0, 3).toUpperCase() : '?')
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        flexShrink: 0,
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.34,
        letterSpacing: 0.3,
        boxShadow: ring ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${bg}` : 'none',
      }}
    >
      {letters}
    </div>
  )
}
