import { AlertTriangle, Radio } from 'lucide-react'

const headlines = [
  "🔴 BREAKING: IDF strikes Tehran missile sites — multiple explosions reported",
  "⚠️ GPS jamming reported across Gush Dan — Waze/Google Maps unreliable",
  "🚢 Hormuz Strait blockade: Milk +15% | Eggs +15% | Fuel rationing expected",
  "🏠 Home Front Command: 60 seconds to reach shelter in Tel Aviv & central district",
  "📡 Iron Dome interceptions over Haifa Bay — stay in sheltered areas",
  "⚡ Rolling blackouts scheduled 22:00-06:00 — charge devices now",
  "🔴 Hezbollah launches confirmed from southern Lebanon — northern residents to shelters",
  "📱 Cellular networks congested — use SMS, avoid calls",
  "🏥 Ichilov Hospital operating on emergency generators",
  "⚠️ IDF Spokesman: Residents between Hadera and Gedera — remain near sheltered spaces",
]

export function NewsTicker() {
  const doubled = [...headlines, ...headlines]

  return (
    <div className="relative w-full bg-noir-surface border-b border-alert-red/30 overflow-hidden">
      <div className="flex items-center">
        {/* Live badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-alert-red px-3 py-2 z-10">
          <Radio size={14} className="animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-white">LIVE</span>
        </div>

        {/* Alert icon */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 text-neon-amber z-10 bg-noir-surface">
          <AlertTriangle size={14} />
          <span className="text-xs font-bold">Mar 18, 2026</span>
        </div>

        {/* Scrolling headlines */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap flex gap-16 py-2">
            {doubled.map((headline, i) => (
              <span key={i} className="text-sm text-text-primary/90 inline-block">
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
