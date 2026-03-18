import { motion } from 'framer-motion'
import { Shield, CheckCircle } from 'lucide-react'

interface ShelterSafeProps {
  inventory: string[]
  timeSurvived: number
  onContinue: () => void
}

export function ShelterSafe({ inventory, timeSurvived, onContinue }: ShelterSafeProps) {
  const minutes = Math.floor(timeSurvived / 60)
  const seconds = timeSurvived % 60

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className="p-4 rounded-full bg-neon-green/10 border border-neon-green/30">
          <Shield size={48} className="text-neon-green" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-neon-green mb-2"
      >
        You Made It!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-text-muted mb-8 text-center"
      >
        Safe in the shelter. The walls shake with each impact.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs flex flex-col gap-3 mb-8"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-noir-card border border-noir-border rounded">
          <span className="text-xs text-text-muted">Time Survived</span>
          <span className="text-xs text-neon-amber font-bold tabular-nums">{minutes}:{String(seconds).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-noir-card border border-noir-border rounded">
          <span className="text-xs text-text-muted">Items Packed</span>
          <span className="text-xs text-neon-amber font-bold">{inventory.length}</span>
        </div>
        {inventory.length > 0 && (
          <div className="px-4 py-2 bg-noir-card border border-noir-border rounded">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Inventory</span>
            <div className="flex flex-wrap gap-1">
              {inventory.map(item => (
                <span key={item} className="flex items-center gap-1 text-[10px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
                  <CheckCircle size={10} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-8 py-3 bg-neon-green/20 text-neon-green font-bold text-sm uppercase tracking-widest rounded border border-neon-green/30 cursor-pointer hover:bg-neon-green/30 transition-colors"
      >
        Return to Apartment
      </motion.button>
    </div>
  )
}
