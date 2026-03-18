import { Brain, Battery, Banknote, AlertTriangle } from 'lucide-react'

interface StatsBarProps {
  sanity: number
  battery: number
  cash: number
}

function StatItem({
  icon: Icon,
  label,
  value,
  max,
  color,
  barColor,
  warning,
}: {
  icon: typeof Brain
  label: string
  value: number
  max: number
  color: string
  barColor: string
  warning: boolean
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const displayValue = label === 'Cash' ? `₪${value}` : `${pct}%`

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className={warning ? 'text-alert-red animate-pulse' : color} />
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{label}</span>
        </div>
        <span className={`text-xs font-bold tabular-nums stat-glow ${warning ? 'text-alert-red' : color}`}>
          {displayValue}
        </span>
      </div>
      <div className="w-full h-2 bg-noir-border/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            warning
              ? 'bg-alert-red shadow-[0_0_8px_rgba(255,23,68,0.6)]'
              : barColor
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function StatsBar({ sanity, battery, cash }: StatsBarProps) {
  const showWarning = sanity < 30 || battery < 20

  return (
    <div className="flex flex-col gap-1 py-2 px-4 bg-noir-surface/70 border-b border-noir-border/60 backdrop-blur-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(68, 138, 255, 0.2))' }}>
      {showWarning && (
        <div className="flex items-center gap-1.5 text-[9px] text-alert-red uppercase tracking-widest animate-pulse mb-0.5">
          <AlertTriangle size={10} />
          <span>
            {sanity < 30 && battery < 20 ? 'Low Sanity & Battery!' : sanity < 30 ? 'Low Sanity!' : 'Low Battery!'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <StatItem
          icon={Brain}
          label="Sanity"
          value={sanity}
          max={100}
          color="text-neon-blue"
          barColor="bg-neon-blue shadow-[0_0_6px_rgba(68,138,255,0.4)]"
          warning={sanity < 20}
        />
        <StatItem
          icon={Battery}
          label="Battery"
          value={battery}
          max={100}
          color="text-neon-green"
          barColor="bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.4)]"
          warning={battery < 15}
        />
        <StatItem
          icon={Banknote}
          label="Cash"
          value={cash}
          max={999}
          color="text-neon-amber"
          barColor="bg-neon-amber shadow-[0_0_6px_rgba(255,171,0,0.4)]"
          warning={false}
        />
      </div>
    </div>
  )
}
