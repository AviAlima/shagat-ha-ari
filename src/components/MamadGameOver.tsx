import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Package, BrainCog, Users, RotateCcw } from 'lucide-react'

export interface MamadGameOverProps {
  reason: 'sanity' | 'supplies' | 'morale' | 'survived'
  daysInMamad: number
  timeSurvived: number
  onRetry: () => void
}

const REASON_CONFIG = {
  sanity: {
    title: 'You Broke Down',
    description: "Your mind couldn't take it anymore. The walls closed in, and you couldn't hold it together.",
    icon: BrainCog,
    accentColor: 'text-alert-red',
    bgGlow: 'bg-alert-red/10',
    borderColor: 'border-alert-red/30',
  },
  supplies: {
    title: 'Supplies Ran Out',
    description: 'You ran out of supplies. The family is desperate. There is nothing left.',
    icon: Package,
    accentColor: 'text-alert-red',
    bgGlow: 'bg-alert-red/10',
    borderColor: 'border-alert-red/30',
  },
  morale: {
    title: 'The Family Fell Apart',
    description: 'The family fell apart. Everyone retreated into silence. No one could reach each other.',
    icon: Users,
    accentColor: 'text-alert-red',
    bgGlow: 'bg-alert-red/10',
    borderColor: 'border-alert-red/30',
  },
  survived: {
    title: 'You Made It',
    description: 'After 7 days, a ceasefire was announced. You made it. Your family made it.',
    icon: Shield,
    accentColor: 'text-neon-green',
    bgGlow: 'bg-neon-green/8',
    borderColor: 'border-neon-green/30',
  },
}

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const steps = 30
    const stepTime = duration / steps
    const increment = target / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), target)
      setValue(current)
      if (step >= steps) {
        clearInterval(timer)
        setValue(target)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target, duration])

  return <>{value}</>
}

export function MamadGameOver({ reason, daysInMamad, timeSurvived, onRetry }: MamadGameOverProps) {
  const config = REASON_CONFIG[reason]
  const IconComponent = config.icon
  const isWin = reason === 'survived'

  const minutes = Math.floor(timeSurvived / 60)
  const seconds = timeSurvived % 60

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative">
      {/* Ambient glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${
          isWin ? 'bg-neon-green/5' : 'bg-alert-red/10'
        } rounded-full blur-3xl`}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6 relative"
      >
        <div className={`p-4 rounded-full ${config.bgGlow} border ${config.borderColor} ${isWin ? '' : 'animate-pulse-red'}`}>
          <IconComponent size={48} className={config.accentColor} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-2xl font-bold ${config.accentColor} mb-2 text-center`}
      >
        {config.title}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-text-muted mb-2 text-center max-w-xs"
      >
        {config.description}
      </motion.p>

      {isWin && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-text-muted mb-8 text-center max-w-xs italic"
        >
          The war isn't over. But today, you survived.
        </motion.p>
      )}

      {!isWin && <div className="mb-8" />}

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: isWin ? 0.9 : 0.7 }}
        className="w-full max-w-xs flex flex-col gap-3 mb-8"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-noir-card border border-noir-border rounded">
          <span className="text-xs text-text-muted">Days in Mamad</span>
          <span className="text-xs text-neon-amber font-bold tabular-nums">
            <CountUp target={daysInMamad} />
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-noir-card border border-noir-border rounded">
          <span className="text-xs text-text-muted">Time Survived</span>
          <span className="text-xs text-neon-amber font-bold tabular-nums">
            <CountUp target={minutes} />:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        {isWin && (
          <div className="flex items-center justify-between px-4 py-2 bg-noir-card border border-noir-border rounded">
            <span className="text-xs text-text-muted">Family Kept Safe</span>
            <span className="text-xs text-neon-green font-bold">Everyone</span>
          </div>
        )}
      </motion.div>

      {/* Retry button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: isWin ? 1.1 : 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className={`flex items-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-widest rounded cursor-pointer transition-colors ${
          isWin
            ? 'bg-neon-green text-noir-bg hover:bg-neon-green/80'
            : 'bg-alert-red text-white hover:bg-alert-red/80'
        }`}
      >
        <RotateCcw size={16} />
        {isWin ? 'Play Again' : 'Try Again'}
      </motion.button>
    </div>
  )
}
