const PATHS: Record<string, string> = {
  standen:   'M4 19V10M10 19V5M16 19v-7M3 19h18',
  programma: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM4 9h16M8 3v3M16 3v3',
  team:      'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 19v-1a4 4 0 00-3-3.87M16.5 3.13A4 4 0 0118 10.5',
  ster:      'M12 3.5l2.6 5.3 5.9.85-4.25 4.14 1 5.86L12 17.1l-5.25 2.75 1-5.86L3.5 9.65l5.9-.85L12 3.5z',
  plus:      'M12 5v14M5 12h14',
  rechts:    'M9 6l6 6-6 6',
  links:     'M15 6l-6 6 6 6',
  omlaag:    'M6 9l6 6 6-6',
  check:     'M5 12.5l4.5 4.5L19 7',
  x:         'M6 6l12 12M18 6L6 18',
  klok:      'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3.5 2',
  pin:       'M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  telefoon:  'M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z',
  mail:      'M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zM4 7l8 6 8-6',
  potlood:   'M4 20h4L18.5 9.5a2.12 2.12 0 00-3-3L5 17v3zM13.5 7.5l3 3',
  verplaats: 'M7 4L3 8l4 4M3 8h13a4 4 0 014 4M17 20l4-4-4-4M21 16H8a4 4 0 01-4-4',
  bel:       'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  dashboard: 'M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 11h7v9h-7v-9zM4 13h7v7H4v-7z',
  groep:     'M17 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM22 20v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0117.5 10.5',
  zoek:      'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4-4',
  filter:    'M3 5h18l-7 8v6l-4-2v-4L3 5z',
  info:      'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 7.5h.01',
  alert:     'M10.3 4.3L2.6 17.5A1.5 1.5 0 004 20h16a1.5 1.5 0 001.3-2.5L13.7 4.3a1.5 1.5 0 00-2.6 0zM12 9v4M12 16.5h.01',
  net:       'M3 7h18M3 11h18M3 15h18M6 7v8M10 7v8M14 7v8M18 7v8M2 6h20',
  uit:       'M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4',
  settings:  'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V19a2 2 0 11-4 0v-.1A1.6 1.6 0 005.6 17l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 002 12.4 2 2 0 014 9h.1A1.6 1.6 0 005.6 6.3l-.1-.1A2 2 0 118.3 3.4l.1.1A1.6 1.6 0 0011 3a2 2 0 014 0 1.6 1.6 0 002.4 1.4l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0021 11a2 2 0 010 4 1.6 1.6 0 00-1.6 1z',
  vink:      'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  trofee:    'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 5H4v2a3 3 0 003 3M17 5h3v2a3 3 0 01-3 3',
}

interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
  filled?: boolean
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8, className, filled }: IconProps) {
  const d = PATHS[name] || ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  )
}
