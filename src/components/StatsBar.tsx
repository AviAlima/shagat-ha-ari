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
      <Icon size={16} className={warning ? 'text-alert-red animate-pulse' : color} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
        <div className="w-24 h-1.5 bg-noir-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              warning ? 'bg-alert-red' : color.replace('text-', 'bg-')
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className={`text-xs font-bold tabular-nums ${warning ? 'text-alert-red' : color}`}>
        {label === 'Cash' ? `₪${value}` : `${pct}%`}
      </span>
    </div>
  )
}

export function StatsBar({ sanity, battery, cash }: StatsBarProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-3 px-4 bg-noir-surface/50 border-b border-noir-border">
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
