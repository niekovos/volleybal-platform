import { Monogram } from './Monogram'
import { StatusBadge } from './StatusBadge'
import { Score } from './Score'
import { Icon } from './Icon'
import { fmtDag } from '@/lib/utils'
import type { Wedstrijd, AppData } from '@/lib/types'

interface WedstrijdRijProps {
  wedstrijd: Wedstrijd
  teams: AppData['teams']
  locaties: AppData['locaties']
  onClick?: () => void
  highlightTeam?: string
  showPoule?: boolean
  pouleName?: string
}

export function WedstrijdRij({ wedstrijd: w, teams, locaties, onClick, highlightTeam, showPoule, pouleName }: WedstrijdRijProps) {
  const th = teams[w.thuis_id]
  const ui = teams[w.uit_id]
  const l = locaties[w.locatie_id]
  if (!th || !ui || !l) return null
  const hlT = w.thuis_id === highlightTeam
  const hlU = w.uit_id === highlightTeam
  const dagLabel = fmtDag(w.datum)

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>
          {dagLabel} · {w.tijd}{showPoule && pouleName ? ` · ${pouleName}` : ''}
        </span>
        <StatusBadge status={w.status} small />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <Monogram kort={th.kort} hue={th.hue} size={32} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: hlT ? 800 : 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {th.naam}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 54 }}>
          {w.status === 'gespeeld'
            ? <Score uitslag={w.uitslag} />
            : <span style={{ fontFamily: 'var(--font-num)', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>vs</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
          <Monogram kort={ui.kort} hue={ui.hue} size={32} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: hlU ? 800 : 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
            {ui.naam}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
        <Icon name="pin" size={14} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5 }}>{l.naam}, {l.plaats}</span>
      </div>
    </div>
  )
}
