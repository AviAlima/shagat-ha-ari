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
  tickColor,
  warning,
}: {
  icon: typeof Brain
  label: string
  value: number
  max: number
  color: string
  barColor: string
  tickColor: string
  warning: boolean
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const displayValue = label === 'Cash' ? `₪${value}` : `${pct}%`

  return (
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-md border shrink-0 ${
              warning
                ? 'bg-alert-red/15 border-alert-red/40 text-alert-red'
                : `${color} border-noir-border bg-noir-card`
            }`}
          >
            <Icon size={13} />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold truncate">{label}</span>
        </div>
        <span
          className={`text-xs font-bold tabular-nums ${warning ? 'text-alert-red text-glow-red' : `${color} stat-glow`}`}
        >
          {displayValue}
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = pct / 10 > i
          const partial = !filled && pct > i * 10 && pct < (i + 1) * 10
          const fillPct = partial ? ((pct - i * 10) / 10) * 100 : 0
          return (
            <div key={i} className="flex-1 h-2 rounded-[3px] bg-noir-border/50 overflow-hidden">
              <div
                className={`h-full rounded-[3px] transition-all duration-500 ${
                  warning ? 'bg-alert-red shadow-[0_0_6px_rgba(255,23,68,0.7)]' : barColor
                }`}
                style={{ width: `${filled ? 100 : fillPct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className={`flex justify-between text-[8px] ${tickColor} select-none`}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}

export function StatsBar({ sanity, battery, cash }: StatsBarProps) {
  const showWarning = sanity < 30 || battery < 20

  return (
    <div className="flex flex-col gap-2 py-2.5 px-4 bg-noir-surface/70 border-b border-noir-border/60 backdrop-blur-md">
      {showWarning && (
        <div className="flex items-center gap-1.5 text-[9px] text-alert-red uppercase tracking-widest animate-pulse">
          <AlertTriangle size={10} />
          <span>
            {sanity < 30 && battery < 20 ? 'Low Sanity & Battery!' : sanity < 30 ? 'Low Sanity!' : 'Low Battery!'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <StatItem
          icon={Brain}
          label="Sanity"
          value={sanity}
          max={100}
          color="text-neon-blue"
          barColor="bg-neon-blue shadow-[0_0_6px_rgba(92,141,255,0.5)]"
          tickColor="text-neon-blue/30"
          warning={sanity < 20}
        />
        <StatItem
          icon={Battery}
          label="Battery"
          value={battery}
          max={100}
          color="text-neon-green"
          barColor="bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.5)]"
          tickColor="text-neon-green/30"
          warning={battery < 15}
        />
        <StatItem
          icon={Banknote}
          label="Cash"
          value={cash}
          max={999}
          color="text-neon-amber"
          barColor="bg-neon-amber shadow-[0_0_6px_rgba(255,171,0,0.5)]"
          tickColor="text-neon-amber/30"
          warning={false}
        />
      </div>
    </div>
  )
}
