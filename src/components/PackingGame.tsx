import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets,
  Cross,
  BatteryCharging,
  Cookie,
  FileText,
  Flashlight,
  BedDouble,
  Radio,
} from 'lucide-react'

interface PackingGameProps {
  countdown: number
  onCountdownTick: () => void
  onDone: (items: string[]) => void
}

interface PackableItem {
  id: string
  label: string
  icon: typeof Droplets
  slots: number
}

const availableItems: PackableItem[] = [
  { id: 'water', label: 'Water', icon: Droplets, slots: 1 },
  { id: 'firstaid', label: 'First Aid', icon: Cross, slots: 2 },
  { id: 'charger', label: 'Charger', icon: BatteryCharging, slots: 1 },
  { id: 'snacks', label: 'Snacks', icon: Cookie, slots: 1 },
  { id: 'documents', label: 'ID Docs', icon: FileText, slots: 1 },
  { id: 'flashlight', label: 'Flashlight', icon: Flashlight, slots: 1 },
  { id: 'blanket', label: 'Blanket', icon: BedDouble, slots: 4 },
  { id: 'radio', label: 'Radio', icon: Radio, slots: 2 },
]

const MAX_SLOTS = 8
const PACKING_TIME = 15

export function PackingGame({ countdown, onCountdownTick, onDone }: PackingGameProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [packingTimer, setPackingTimer] = useState(PACKING_TIME)

  const usedSlots = availableItems
    .filter(item => selected.has(item.id))
    .reduce((sum, item) => sum + item.slots, 0)

  // Packing timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPackingTimer(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Siren countdown continues
  useEffect(() => {
    const timer = setInterval(() => {
      onCountdownTick()
    }, 1000)
    return () => clearInterval(timer)
  }, [onCountdownTick])

  // Auto-transition when packing time runs out
  useEffect(() => {
    if (packingTimer <= 0) {
      onDone(Array.from(selected))
    }
  }, [packingTimer, onDone, selected])

  const toggleItem = useCallback((item: PackableItem) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        const currentUsed = availableItems
          .filter(i => next.has(i.id))
          .reduce((sum, i) => sum + i.slots, 0)
        if (currentUsed + item.slots <= MAX_SLOTS) {
          next.add(item.id)
        }
      }
      return next
    })
  }, [])

  const handleGo = useCallback(() => {
    onDone(Array.from(selected))
  }, [onDone, selected])

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-alert-red uppercase tracking-widest">Pack Your Bag</h2>
          <p className="text-[10px] text-text-muted mt-1">Click items to add/remove. {MAX_SLOTS} slots max.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-text-muted">
            Siren: <span className="text-alert-red font-bold tabular-nums">{countdown}s</span>
          </div>
          <div className="text-xs text-text-muted">
            Packing: <span className="text-neon-amber font-bold tabular-nums">{packingTimer}s</span>
          </div>
        </div>
      </div>

      {/* Slot indicator */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: MAX_SLOTS }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-2 rounded-sm transition-colors ${
              i < usedSlots ? 'bg-neon-green' : 'bg-noir-border'
            }`}
          />
        ))}
        <span className="text-[10px] text-text-muted ml-2">{usedSlots}/{MAX_SLOTS}</span>
      </div>

      {/* Packing timer bar */}
      <div className="w-full h-1.5 bg-noir-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-neon-amber rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: PACKING_TIME, ease: 'linear' }}
        />
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-4 gap-2 flex-1 content-start">
        {availableItems.map((item) => {
          const isSelected = selected.has(item.id)
          const canFit = usedSlots + item.slots <= MAX_SLOTS

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleItem(item)}
              disabled={!isSelected && !canFit}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-neon-green/60 bg-neon-green/10 shadow-[0_0_10px_rgba(0,230,118,0.1)]'
                  : canFit
                    ? 'border-noir-border bg-noir-card/50 hover:border-text-muted/30'
                    : 'border-noir-border/50 bg-noir-card/20 opacity-40 cursor-not-allowed'
              }`}
            >
              <item.icon
                size={22}
                className={isSelected ? 'text-neon-green' : 'text-text-muted'}
              />
              <span className="text-[10px] text-text-muted leading-tight text-center">{item.label}</span>
              <span className={`text-[9px] ${isSelected ? 'text-neon-green' : 'text-text-muted/50'}`}>
                {item.slots} slot{item.slots > 1 ? 's' : ''}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Go button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGo}
        className="mt-4 w-full py-3 bg-alert-red text-white font-bold text-sm uppercase tracking-widest rounded cursor-pointer hover:bg-alert-red/80 transition-colors"
      >
        Go! Run to Shelter
      </motion.button>
    </div>
  )
}
