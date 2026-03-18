import { motion } from 'framer-motion'
import { X, Footprints, BatteryCharging, CoffeeIcon } from 'lucide-react'
import type { Upgrades } from '../hooks/useGameState'

interface ShopProps {
  cash: number
  upgrades: Upgrades
  onBuy: (key: keyof Upgrades, cost: number) => void
  onClose: () => void
}

const items: { key: keyof Upgrades; label: string; desc: string; cost: number; icon: typeof Footprints }[] = [
  { key: 'sneakers', label: 'Sneakers', desc: 'Run faster to shelter', cost: 80, icon: Footprints },
  { key: 'powerbank', label: 'Powerbank', desc: 'Battery drains 50% slower', cost: 60, icon: BatteryCharging },
  { key: 'premiumCoffee', label: 'Premium Coffee', desc: 'Double sanity from coffee', cost: 40, icon: CoffeeIcon },
]

export function Shop({ cash, upgrades, onBuy, onClose }: ShopProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-noir-bg/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm mx-4 bg-noir-surface border border-noir-border rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-noir-border">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Shop</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neon-amber font-bold">₪{cash}</span>
            <button onClick={onClose} className="text-text-muted hover:text-alert-red transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="p-3 flex flex-col gap-2">
          {items.map(({ key, label, desc, cost, icon: Icon }) => {
            const owned = upgrades[key]
            const canAfford = cash >= cost

            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded border ${
                  owned
                    ? 'border-neon-green/30 bg-neon-green/5'
                    : 'border-noir-border bg-noir-card/50'
                }`}
              >
                <Icon size={22} className={owned ? 'text-neon-green' : 'text-alert-red'} />
                <div className="flex-1">
                  <div className="text-xs font-bold text-text-primary">{label}</div>
                  <div className="text-[10px] text-text-muted">{desc}</div>
                </div>
                {owned ? (
                  <span className="text-[10px] text-neon-green uppercase tracking-wider font-bold">Owned</span>
                ) : (
                  <button
                    onClick={() => onBuy(key, cost)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      canAfford
                        ? 'bg-alert-red text-white hover:bg-alert-red/80'
                        : 'bg-noir-border text-text-muted/50 cursor-not-allowed'
                    }`}
                  >
                    ₪{cost}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
