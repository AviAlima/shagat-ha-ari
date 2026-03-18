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

  const urgencyText = countdown > 45
    ? 'GET READY!'
    : countdown > 25
      ? 'MOVE NOW!'
      : 'RUN!'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 flex items-center justify-center"
    >
      {/* Full-screen red flash — more intense */}
      <motion.div
        animate={{
          backgroundColor: ['rgba(255,23,68,0.2)', 'rgba(255,23,68,0.5)', 'rgba(255,23,68,0.2)'],
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="absolute inset-0"
      />

      {/* Vignette overlay for intensity */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Shaking content — more aggressive shake with Y axis */}
      <motion.div
        animate={{
          x: [0, -8, 6, -10, 8, -4, 6, 0],
          y: [0, -3, 4, -2, 5, -4, 2, 0],
        }}
        transition={{ duration: 0.35, repeat: Infinity }}
        className="relative flex flex-col items-center gap-6 z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Siren size={80} className="text-alert-red drop-shadow-[0_0_30px_rgba(255,23,68,0.8)]" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold text-alert-red text-center animate-pulse-red px-6 py-3">
          ALERT! INCOMING!
        </h1>

        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="text-7xl md:text-8xl font-bold text-white tabular-nums stat-glow"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {countdown}s
          </motion.div>
          <motion.span
            key={urgencyText}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg md:text-xl font-bold text-alert-red uppercase tracking-widest stat-glow"
          >
            {urgencyText}
          </motion.span>
        </div>

        <p className="text-sm text-text-muted/80 animate-pulse tracking-wider">
          Get to shelter NOW
        </p>
      </motion.div>
    </motion.div>
  )
}
