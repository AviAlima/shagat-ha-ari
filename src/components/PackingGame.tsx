import { useState, useEffect, useCallback } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import {
  Droplets,
  Cross,
  BatteryCharging,
  Cookie,
  FileText,
  Flashlight,
  BedDouble,
  Radio,
  Check,
  Backpack,
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

const MAX_SLOTS = 6
const PACKING_TIME = 8

export function PackingGame({ countdown, onCountdownTick, onDone }: PackingGameProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [packingTimer, setPackingTimer] = useState(PACKING_TIME)
  const [shuffledOrder, setShuffledOrder] = useState<number[]>(() =>
    Array.from({ length: availableItems.length }, (_, i) => i)
  )

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

  // Shaky hands — shuffle item positions as countdown drops
  useEffect(() => {
    let interval: number | undefined

    if (countdown > 35) {
      return
    }

    const getDelay = () => {
      if (countdown < 15) return 1200
      if (countdown < 25) return 2000
      return 3000
    }

    const shuffle = () => {
      setShuffledOrder(prev => {
        const arr = [...prev]
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
      })
    }

    interval = window.setInterval(shuffle, getDelay())
    return () => { if (interval) clearInterval(interval) }
  }, [countdown])

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

  const timerColor = packingTimer <= 5 ? 'text-alert-red' : packingTimer <= 10 ? 'text-neon-amber' : 'text-neon-green'
  const timerBarColor = packingTimer <= 5 ? 'bg-alert-red' : packingTimer <= 10 ? 'bg-neon-amber' : 'bg-neon-green'

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-alert-red uppercase tracking-widest">Pack Your Bag</h2>
          <p className="text-[10px] text-text-muted mt-1">Tap items to add/remove</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-xs text-text-muted">
            Siren: <span className="text-alert-red font-bold tabular-nums stat-glow">{countdown}s</span>
          </div>
          <div className="text-xs text-text-muted">
            Packing: <span className={`${timerColor} font-bold tabular-nums stat-glow`}>{packingTimer}s</span>
          </div>
        </div>
      </div>

      {/* Backpack capacity */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-noir-card/60 rounded-lg border border-noir-border/50">
        <Backpack size={16} className="text-neon-amber" />
        <div className="flex items-center gap-1 flex-1">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2.5 rounded-sm transition-all duration-200 ${
                i < usedSlots ? 'bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.3)]' : 'bg-noir-border/60'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-text-muted font-bold tabular-nums ml-1">{usedSlots}/{MAX_SLOTS}</span>
      </div>

      {/* Packing timer bar — changes color */}
      <div className="w-full h-2 bg-noir-border rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full ${timerBarColor} rounded-full transition-colors duration-500`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: PACKING_TIME, ease: 'linear' }}
        />
      </div>

      {/* Shaky hands indicator */}
      {countdown < 25 && (
        <motion.p
          className="text-center text-xs text-alert-red font-bold mb-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Hands shaking...
        </motion.p>
      )}

      {/* Items grid */}
      <LayoutGroup>
        <div className="grid grid-cols-4 gap-2.5 flex-1 content-start">
          {shuffledOrder.map((index) => {
            const item = availableItems[index]
            const isSelected = selected.has(item.id)
            const canFit = usedSlots + item.slots <= MAX_SLOTS

            return (
              <motion.button
                key={item.id}
                layout
                layoutId={item.id}
                animate={{
                  rotate: countdown < 20 ? (index % 2 === 0 ? 2 : -2) : 0,
                }}
                transition={{ layout: { duration: 0.4, type: 'spring' } }}
                whileTap={{ scale: 0.9 }}
                whileHover={!isSelected && canFit ? { scale: 1.05 } : {}}
                onClick={() => toggleItem(item)}
                disabled={!isSelected && !canFit}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neon-green/70 bg-neon-green/10 shadow-[0_0_16px_rgba(0,230,118,0.2)]'
                    : canFit
                      ? 'border-noir-border bg-noir-card/50 hover:border-text-muted/40 hover:bg-noir-card/70'
                      : 'border-noir-border/30 bg-noir-card/20 opacity-30 cursor-not-allowed'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,230,118,0.4)]">
                    <Check size={12} className="text-noir-bg" strokeWidth={3} />
                  </div>
                )}
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-neon-green/15' : ''}`}>
                  <item.icon
                    size={26}
                    className={isSelected ? 'text-neon-green' : canFit ? 'text-text-muted' : 'text-text-muted/30'}
                  />
                </div>
                <span className={`text-[10px] leading-tight text-center font-bold ${isSelected ? 'text-neon-green' : 'text-text-muted'}`}>{item.label}</span>
                <span className={`text-[9px] ${isSelected ? 'text-neon-green/70' : 'text-text-muted/40'}`}>
                  {item.slots} slot{item.slots > 1 ? 's' : ''}
                </span>
              </motion.button>
            )
          })}
        </div>
      </LayoutGroup>

      {/* Go button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGo}
        className="mt-4 w-full py-3.5 bg-alert-red text-white font-bold text-sm uppercase tracking-widest rounded-lg cursor-pointer hover:bg-alert-red/80 transition-colors shadow-[0_0_20px_rgba(255,23,68,0.3)] animate-pulse-red"
      >
        GO! Run to Shelter
      </motion.button>
    </div>
  )
}
