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
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative">
      {/* Green ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-green/8 rounded-full blur-3xl" />

      {/* SAFE banner */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-4 relative"
      >
        <div className="p-5 rounded-full bg-neon-green/10 border-2 border-neon-green/40 glow-green">
          <Shield size={52} className="text-neon-green drop-shadow-[0_0_16px_rgba(0,230,118,0.5)]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-3 px-8 py-1.5 bg-neon-green/15 border border-neon-green/30 rounded-full"
      >
        <span className="text-lg font-bold text-neon-green uppercase tracking-[0.3em] stat-glow">SAFE</span>
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
        className="text-sm text-text-muted mb-2 text-center"
      >
        You made it. Catch your breath.
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-text-muted/50 mb-8 text-center italic"
      >
        The walls shake with each impact outside.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs flex flex-col gap-3 mb-8"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-noir-card border border-noir-border rounded-lg">
          <span className="text-xs text-text-muted">Time Survived</span>
          <span className="text-xs text-neon-amber font-bold tabular-nums stat-glow">{minutes}:{String(seconds).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 bg-noir-card border border-noir-border rounded-lg">
          <span className="text-xs text-text-muted">Items Packed</span>
          <span className="text-xs text-neon-amber font-bold">{inventory.length}</span>
        </div>
        {inventory.length > 0 && (
          <div className="px-4 py-3 bg-noir-card border border-noir-border rounded-lg">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-2">Inventory</span>
            <div className="flex flex-wrap gap-1.5">
              {inventory.map(item => (
                <span key={item} className="flex items-center gap-1 text-[10px] text-neon-green bg-neon-green/10 border border-neon-green/20 px-2.5 py-1 rounded-full">
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
        className="px-8 py-3.5 bg-neon-green/20 text-neon-green font-bold text-sm uppercase tracking-widest rounded-lg border border-neon-green/30 cursor-pointer hover:bg-neon-green/30 transition-colors glow-green"
      >
        Return to Apartment
      </motion.button>
    </div>
  )
}
