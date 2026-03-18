import { motion } from 'framer-motion'
import { Skull, RotateCcw } from 'lucide-react'

interface GameOverProps {
  timeSurvived: number
  cashEarned: number
  inventory: string[]
  onRetry: () => void
}

export function GameOver({ timeSurvived, cashEarned, inventory, onRetry }: GameOverProps) {
  const minutes = Math.floor(timeSurvived / 60)
  const seconds = timeSurvived % 60

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      {/* Red ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-alert-red/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6 relative"
      >
        <div className="p-4 rounded-full bg-alert-red/10 border border-alert-red/30 animate-pulse-red">
          <Skull size={48} className="text-alert-red" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-alert-red mb-2 text-center"
      >
        You Didn't Make It
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-text-muted mb-8 text-center max-w-xs"
      >
        You didn't reach the shelter in time. The siren countdown reached zero.
      </motion.p>

      {[
        { label: 'Time Survived', value: `${minutes}:${String(seconds).padStart(2, '0')}`, delay: 0.7 },
        { label: 'Cash Earned', value: `₪${cashEarned}`, delay: 0.85 },
        { label: 'Items Packed', value: `${inventory.length}`, delay: 1.0 },
      ].map(({ label, value, delay }) => (
        <motion.div
          key={label}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay }}
          className="w-full max-w-xs"
        >
          <div className="flex items-center justify-between px-4 py-2.5 mb-2 bg-noir-card border border-noir-border rounded-lg">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-xs text-neon-amber font-bold tabular-nums stat-glow">{value}</span>
          </div>
        </motion.div>
      ))}

      <div className="mb-4" />

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="flex items-center gap-2 px-8 py-3.5 bg-alert-red text-white font-bold text-sm uppercase tracking-widest rounded-lg cursor-pointer hover:bg-alert-red/80 transition-colors animate-pulse-red"
      >
        <RotateCcw size={16} />
        Try Again
      </motion.button>
    </div>
  )
}
