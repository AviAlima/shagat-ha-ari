import { Brain, Battery, Banknote } from 'lucide-react'

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
  warning,
}: {
  icon: typeof Brain
  label: string
  value: number
  max: number
  color: string
  warning: boolean
}) {
  const pct = Math.round((value / max) * 100)

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1 rounded ${warning ? 'bg-alert-red/10' : ''}`}>
        <Icon size={16} className={warning ? 'text-alert-red animate-pulse' : color} />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">{label}</span>
          <span className={`text-[10px] font-bold tabular-nums ${warning ? 'text-alert-red stat-glow' : color}`}>
            {label === 'Cash' ? `₪${value}` : `${pct}%`}
          </span>
        </div>
        <div className="w-20 h-1.5 bg-noir-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              warning ? 'bg-alert-red shadow-[0_0_6px_rgba(255,23,68,0.5)]' : color.replace('text-', 'bg-')
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function StatsBar({ sanity, battery, cash }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-4 bg-noir-surface/60 border-b border-noir-border/60 backdrop-blur-sm">
      <StatItem
        icon={Brain}
        label="Sanity"
        value={sanity}
        max={100}
        color="text-neon-blue"
        warning={sanity < 20}
      />
      <StatItem
        icon={Battery}
        label="Battery"
        value={battery}
        max={100}
        color="text-neon-green"
        warning={battery < 15}
      />
      <StatItem
        icon={Banknote}
        label="Cash"
        value={cash}
        max={999}
        color="text-neon-amber"
        warning={false}
      />
    </div>
  )
}
