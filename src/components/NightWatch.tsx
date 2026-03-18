import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NightWatchProps {
  mamadDay: number
  onComplete: (suppliesGained: number, moraleLost: number) => void
}

interface Threat {
  id: number
  x: number
  y: number
  expiresAt: number
}

interface FlashEffect {
  id: number
  x: number
  y: number
  color: 'green' | 'red'
}

export function NightWatch({ mamadDay, onComplete }: NightWatchProps) {
  const [timeRemaining, setTimeRemaining] = useState(10)
  const [threats, setThreats] = useState<Threat[]>([])
  const [caught, setCaught] = useState(0)
  const [missed, setMissed] = useState(0)
  const [flashEffects, setFlashEffects] = useState<FlashEffect[]>([])
  const [showResults, setShowResults] = useState(false)

  const nextIdRef = useRef(0)
  const caughtRef = useRef(0)
  const missedRef = useRef(0)
  const completedRef = useRef(false)

  caughtRef.current = caught
  missedRef.current = missed

  const spawnRate = 0.04 + mamadDay * 0.012

  const addFlash = useCallback((x: number, y: number, color: 'green' | 'red') => {
    const id = nextIdRef.current++
    setFlashEffects(prev => [...prev, { id, x, y, color }])
    setTimeout(() => {
      setFlashEffects(prev => prev.filter(f => f.id !== id))
    }, 500)
  }, [])

  const handleThreatClick = useCallback((threatId: number, x: number, y: number) => {
    setThreats(prev => prev.filter(t => t.id !== threatId))
    setCaught(prev => prev + 1)
    addFlash(x, y, 'green')
  }, [addFlash])

  // Core game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setTimeRemaining(prev => {
        const next = prev - 0.1
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true
          clearInterval(interval)
          setShowResults(true)
          setTimeout(() => {
            onComplete(caughtRef.current * 2, missedRef.current * 3)
          }, 1000)
          return 0
        }
        return next
      })

      // Spawn threats
      if (Math.random() < spawnRate) {
        const id = nextIdRef.current++
        const lifetime = 800 + Math.random() * 400
        setThreats(prev => [
          ...prev,
          {
            id,
            x: 10 + Math.random() * 80,
            y: 15 + Math.random() * 70,
            expiresAt: now + lifetime,
          },
        ])
      }

      // Remove expired threats
      setThreats(prev => {
        const expired = prev.filter(t => t.expiresAt <= now)
        const remaining = prev.filter(t => t.expiresAt > now)
        if (expired.length > 0) {
          setMissed(m => m + expired.length)
          expired.forEach(t => addFlash(t.x, t.y, 'red'))
        }
        return remaining
      })
    }, 100)

    return () => clearInterval(interval)
  }, [spawnRate, onComplete, addFlash])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col bg-noir-bg/95 select-none"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\uD83C\uDF19'}</span>
          <span className="text-sm font-bold text-neon-amber uppercase tracking-widest">
            Night Watch
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Day {mamadDay}
          </span>
          <span className="text-sm font-mono text-neon-amber tabular-nums">
            {Math.max(0, timeRemaining).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Play area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Threats */}
        <AnimatePresence>
          {threats.map(threat => (
            <motion.div
              key={threat.id}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleThreatClick(threat.id, threat.x, threat.y)}
              className="absolute w-8 h-8 rounded-full bg-alert-red/80 cursor-pointer shadow-[0_0_12px_rgba(255,23,68,0.5)]"
              style={{
                left: `${threat.x}%`,
                top: `${threat.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full rounded-full bg-alert-red/60"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Flash effects */}
        <AnimatePresence>
          {flashEffects.map(flash => (
            <motion.div
              key={flash.id}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute w-8 h-8 flex items-center justify-center pointer-events-none ${
                flash.color === 'green' ? 'text-neon-green' : 'text-alert-red'
              }`}
              style={{
                left: `${flash.x}%`,
                top: `${flash.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {flash.color === 'green' ? (
                <div className="w-8 h-8 rounded-full border-2 border-neon-green bg-neon-green/20" />
              ) : (
                <span className="text-lg font-bold">{'\u2715'}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Results overlay */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-noir-bg/80"
            >
              <div className="bg-noir-card border border-noir-border rounded-lg p-6 text-center">
                <p className="text-neon-amber text-sm font-bold uppercase tracking-widest mb-3">
                  Night Over
                </p>
                <div className="flex gap-6 text-xs">
                  <div>
                    <span className="text-neon-green font-bold text-lg">{caught}</span>
                    <p className="text-text-muted mt-1">Caught (+{caught * 2} supplies)</p>
                  </div>
                  <div>
                    <span className="text-alert-red font-bold text-lg">{missed}</span>
                    <p className="text-text-muted mt-1">Missed (-{missed * 3} morale)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-noir-border/40 flex justify-center gap-6">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Caught: <span className="text-neon-green font-bold">{caught}</span>
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Missed: <span className="text-alert-red font-bold">{missed}</span>
        </span>
      </div>
    </motion.div>
  )
}
