'use client'
import { Monogram } from './Monogram'
import type { Stand } from '@/lib/types'
import type { AppData } from '@/lib/types'

interface StandenTabelProps {
  standen: Stand[]
  teams: AppData['teams']
  highlight?: string
  onTeam?: (teamId: string) => void
  compact?: boolean
}

export function StandenTabel({ standen, teams, highlight, onTeam, compact = false }: StandenTabelProps) {
  const numCell = (w: number, content: React.ReactNode, align: 'center' | 'right' | 'left' = 'center', extra?: React.CSSProperties) => (
    <div style={{ width: w, flexShrink: 0, textAlign: align, fontFamily: 'var(--font-num)', ...extra }}>{content}</div>
  )
  const head = (w: number, label: string, align: 'center' | 'right' | 'left' = 'center') => (
    <div style={{ width: w, flexShrink: 0, textAlign: align, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: 'var(--ink-3)' }}>{label}</div>
  )

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
        {head(18, '#', 'left')}
        <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--ink-3)' }}>Team</div>
        {head(24, 'G')}
        {!compact && head(24, 'W')}
        {!compact && head(24, 'V')}
        {compact ? head(44, 'Sets') : head(50, 'Sets')}
        {head(32, 'Pnt', 'right')}
      </div>
      {standen.map((r, i) => {
        const t = teams[r.team_id]
        if (!t) return null
        const hl = r.team_id === highlight
        return (
          <div
            key={r.team_id}
            onClick={onTeam ? () => onTeam(r.team_id) : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderBottom: i < standen.length - 1 ? '1px solid var(--line)' : 'none',
              background: hl ? 'var(--primary-soft)' : 'transparent',
              cursor: onTeam ? 'pointer' : 'default',
            }}
          >
            <div style={{ width: 18, flexShrink: 0, fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 700, color: i < 3 ? 'var(--primary)' : 'var(--ink-3)' }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: compact ? 8 : 9 }}>
              <Monogram kort={t.kort} hue={t.hue} size={compact ? 26 : 30} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: hl ? 700 : 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.naam}</span>
            </div>
            {numCell(24, r.g, 'center', { fontSize: 14, color: 'var(--ink-2)' })}
            {!compact && numCell(24, r.w, 'center', { fontSize: 14, color: 'var(--ink-2)' })}
            {!compact && numCell(24, r.v, 'center', { fontSize: 14, color: 'var(--ink-2)' })}
            {compact
              ? numCell(44, `${r.sv}–${r.st}`, 'center', { fontSize: 12, color: 'var(--ink-3)' })
              : numCell(50, `${r.sv}–${r.st}`, 'center', { fontSize: 13, color: 'var(--ink-3)' })}
            {numCell(32, r.pnt, 'right', { fontSize: 16, fontWeight: 700, color: 'var(--ink)' })}
          </div>
        )
      })}
    </div>
  )
}
