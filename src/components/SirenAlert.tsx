import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Siren } from 'lucide-react'

interface SirenAlertProps {
  countdown: number
  onCountdownTick: () => void
  onPackingStart: () => void
}

export function SirenAlert({ countdown, onCountdownTick, onPackingStart }: SirenAlertProps) {
  // Tick the countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      onCountdownTick()
    }, 1000)
    return () => clearInterval(timer)
  }, [onCountdownTick])

  // Auto-transition to packing after 3 seconds of alert display
  useEffect(() => {
    const timer = setTimeout(() => {
      onPackingStart()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onPackingStart])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 flex items-center justify-center"
    >
      {/* Red flashing background */}
      <motion.div
        animate={{
          backgroundColor: ['rgba(255,23,68,0.15)', 'rgba(255,23,68,0.3)', 'rgba(255,23,68,0.15)'],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute inset-0"
      />

      {/* Shaking content */}
      <motion.div
        animate={{ x: [0, -4, 4, -4, 4, 0] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        className="relative flex flex-col items-center gap-4 z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <Siren size={64} className="text-alert-red" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-alert-red text-center animate-pulse-red px-4 py-2">
          ALERT! ALERT! INCOMING!
        </h1>

        <div className="text-5xl font-bold text-white tabular-nums">
          {countdown}s
        </div>

        <p className="text-sm text-text-muted animate-pulse">
          Get to shelter NOW — Packing in progress...
        </p>
      </motion.div>
    </motion.div>
  )
}
