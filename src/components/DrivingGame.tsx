import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DrivingGameProps {
  sanity: number
  onSanityChange: (fn: (prev: number) => number) => void
  onComplete: () => void
  onFail: () => void
}

interface RoadObstacle {
  id: number
  lane: number
  y: number
  type: 'car' | 'debris' | 'dark'
}

const LANE_COUNT = 3
const TOTAL_DISTANCE = 60
const SPEED_KM_PER_TICK = 0.1 // ~2km/s at 50ms ticks
const SIREN_REACTION_TIME = 3000
const SIREN_WAIT_TIME = 5000
const SIREN_INTERVAL_MIN = 20000
const SIREN_INTERVAL_MAX = 30000
const SANITY_DAMAGE = 15

function CarSvg() {
  return (
    <svg viewBox="0 0 30 50" className="w-10 h-14" fill="none">
      {/* Car body */}
      <rect x="5" y="8" width="20" height="34" rx="4" fill="#1a1a2e" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Windshield */}
      <rect x="8" y="12" width="14" height="8" rx="2" fill="#448aff20" stroke="#448aff60" strokeWidth="0.5" />
      {/* Headlights */}
      <rect x="7" y="8" width="4" height="3" rx="1" fill="#ffab00" />
      <rect x="19" y="8" width="4" height="3" rx="1" fill="#ffab00" />
      {/* Taillights */}
      <rect x="7" y="39" width="4" height="3" rx="1" fill="#ff1744" />
      <rect x="19" y="39" width="4" height="3" rx="1" fill="#ff1744" />
      {/* Wheels */}
      <rect x="3" y="14" width="3" height="8" rx="1" fill="#888" />
      <rect x="24" y="14" width="3" height="8" rx="1" fill="#888" />
      <rect x="3" y="30" width="3" height="8" rx="1" fill="#888" />
      <rect x="24" y="30" width="3" height="8" rx="1" fill="#888" />
    </svg>
  )
}

function ObstacleCarSvg() {
  return (
    <svg viewBox="0 0 30 50" className="w-10 h-14" fill="none">
      <rect x="5" y="8" width="20" height="34" rx="4" fill="#0e0e16" stroke="#ff174460" strokeWidth="1" />
      <rect x="7" y="39" width="4" height="3" rx="1" fill="#ff174460" />
      <rect x="19" y="39" width="4" height="3" rx="1" fill="#ff174460" />
    </svg>
  )
}

function DebrisSvg() {
  return (
    <svg viewBox="0 0 30 20" className="w-10 h-6" fill="none">
      <polygon points="5,18 12,4 20,16 28,8 25,18" fill="#1a1a2e" stroke="#ff174440" strokeWidth="1" />
      <line x1="8" y1="14" x2="15" y2="8" stroke="#ff174430" strokeWidth="0.5" />
    </svg>
  )
}

function DarkPatchSvg() {
  return (
    <svg viewBox="0 0 40 20" className="w-14 h-6" fill="none">
      <ellipse cx="20" cy="10" rx="18" ry="8" fill="#06060a" opacity="0.9" />
    </svg>
  )
}

type SirenState = 'none' | 'active' | 'stopped' | 'clear'

export function DrivingGame({ sanity, onSanityChange, onComplete, onFail }: DrivingGameProps) {
  const [playerLane, setPlayerLane] = useState(1) // 0, 1, 2
  const [distance, setDistance] = useState(0)
  const [obstacles, setObstacles] = useState<RoadObstacle[]>([])
  const [screenDim, setScreenDim] = useState(false)
  const [sirenState, setSirenState] = useState<SirenState>('none')
  const [screenShake, setScreenShake] = useState(false)

  const nextObsId = useRef(0)
  const sirenTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const clearTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const distanceRef = useRef(distance)
  distanceRef.current = distance
  const sirenStateRef = useRef(sirenState)
  sirenStateRef.current = sirenState
  const completedRef = useRef(false)

  // Generate obstacles on mount
  useEffect(() => {
    const initial: RoadObstacle[] = []
    const types: Array<'car' | 'debris' | 'dark'> = ['car', 'debris', 'dark']
    for (let i = 0; i < 15; i++) {
      initial.push({
        id: nextObsId.current++,
        lane: Math.floor(Math.random() * LANE_COUNT),
        y: 10 + i * 4 + Math.random() * 3,
        type: types[Math.floor(Math.random() * types.length)],
      })
    }
    setObstacles(initial)
  }, [])

  // Game loop — drive forward
  useEffect(() => {
    if (sirenState === 'active' || sirenState === 'stopped') return
    const timer = setInterval(() => {
      setDistance(prev => {
        const next = prev + SPEED_KM_PER_TICK
        if (next >= TOTAL_DISTANCE && !completedRef.current) {
          completedRef.current = true
          setTimeout(() => onComplete(), 100)
        }
        return Math.min(next, TOTAL_DISTANCE)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [sirenState, onComplete])

  // Dark patch effect
  useEffect(() => {
    const checkDim = () => {
      for (const obs of obstacles) {
        if (obs.type === 'dark') {
          const relY = obs.y - distanceRef.current / (TOTAL_DISTANCE / 60)
          if (relY > -1 && relY < 2) {
            setScreenDim(true)
            return
          }
        }
      }
      setScreenDim(false)
    }
    const timer = setInterval(checkDim, 200)
    return () => clearInterval(timer)
  }, [obstacles])

  // Schedule sirens
  const scheduleSiren = useCallback(() => {
    const delay = SIREN_INTERVAL_MIN + Math.random() * (SIREN_INTERVAL_MAX - SIREN_INTERVAL_MIN)
    sirenTimerRef.current = setTimeout(() => {
      if (distanceRef.current >= TOTAL_DISTANCE) return
      setSirenState('active')

      // Start reaction countdown
      reactionTimerRef.current = setTimeout(() => {
        if (sirenStateRef.current === 'active') {
          // Player didn't press SPACE in time
          onSanityChange(prev => prev - SANITY_DAMAGE)
          setScreenShake(true)
          setTimeout(() => setScreenShake(false), 600)
          setSirenState('none')
          scheduleSiren()
        }
      }, SIREN_REACTION_TIME)
    }, delay)
  }, [onSanityChange])

  useEffect(() => {
    scheduleSiren()
    return () => {
      if (sirenTimerRef.current) clearTimeout(sirenTimerRef.current)
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    }
  }, [scheduleSiren])

  // Check sanity game over
  useEffect(() => {
    if (sanity <= 0) {
      onFail()
    }
  }, [sanity, onFail])

  // Handle SPACE press during siren
  const handleSirenStop = useCallback(() => {
    if (sirenStateRef.current !== 'active') return
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    setSirenState('stopped')

    clearTimerRef.current = setTimeout(() => {
      setSirenState('none')
      scheduleSiren()
    }, SIREN_WAIT_TIME)
  }, [scheduleSiren])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleSirenStop()
      }
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setPlayerLane(prev => Math.max(0, prev - 1))
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSirenStop])

  const progressPct = Math.min(100, (distance / TOTAL_DISTANCE) * 100)
  const laneXPositions = [20, 50, 80] // percentage positions for 3 lanes

  return (
    <motion.div
      className="flex flex-col flex-1 select-none relative overflow-hidden"
      animate={screenShake ? { x: [0, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Screen dim overlay for dark patches */}
      <AnimatePresence>
        {screenDim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Siren overlay */}
      <AnimatePresence>
        {sirenState === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 bg-alert-red/30 z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Siren message */}
      <AnimatePresence>
        {sirenState === 'active' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2"
          >
            <span className="text-2xl font-bold text-alert-red animate-pulse-red px-4 py-2">
              STOP! GET OUT!
            </span>
            <span className="text-xs text-text-muted">Press SPACE to stop and lie flat</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stopped/lying flat message */}
      <AnimatePresence>
        {sirenState === 'stopped' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2"
          >
            <span className="text-lg font-bold text-neon-amber">Lying flat... waiting</span>
            <span className="text-xs text-text-muted">All clear in a moment...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-noir-border z-10">
        <div className="text-xs text-text-muted">
          Distance: <span className="text-neon-green font-bold tabular-nums">{Math.round(distance)}km</span> / {TOTAL_DISTANCE}km
        </div>
        <div className="text-xs text-text-muted">
          Route 1 — <span className="text-neon-amber">Heading to Parents</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-noir-border z-10">
        <div
          className="h-full bg-neon-green transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Road scene */}
      <div className="flex-1 relative overflow-hidden bg-noir-bg">
        {/* Road surface */}
        <div className="absolute inset-x-[10%] inset-y-0 bg-noir-surface border-l-2 border-r-2 border-noir-border" />

        {/* Lane markings — animated scrolling */}
        {[35, 65].map((x) => (
          <div key={x} className="absolute inset-y-0" style={{ left: `${x}%` }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-8 bg-neon-amber/30"
                style={{
                  top: `${((i * 10 - ((distance * 8) % 120) + 120) % 120) - 10}%`,
                }}
              />
            ))}
          </div>
        ))}

        {/* Roadside silhouettes — left */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-noir-card border-r border-noir-border"
              style={{
                left: 0,
                right: 0,
                height: `${15 + Math.random() * 10}%`,
                top: `${((i * 20 - ((distance * 3) % 120) + 120) % 120) - 10}%`,
              }}
            />
          ))}
        </div>

        {/* Roadside silhouettes — right */}
        <div className="absolute right-0 top-0 bottom-0 w-[10%] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-noir-card border-l border-noir-border"
              style={{
                left: 0,
                right: 0,
                height: `${12 + Math.random() * 10}%`,
                top: `${((i * 22 - ((distance * 3) % 132) + 132) % 132) - 10}%`,
              }}
            />
          ))}
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => {
          const relY = obs.y - distance / (TOTAL_DISTANCE / 60)
          if (relY < -3 || relY > 12) return null
          const screenY = 90 - relY * 8
          const screenX = laneXPositions[obs.lane]
          return (
            <div
              key={obs.id}
              className="absolute"
              style={{
                left: `${screenX}%`,
                top: `${screenY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {obs.type === 'car' && <ObstacleCarSvg />}
              {obs.type === 'debris' && <DebrisSvg />}
              {obs.type === 'dark' && <DarkPatchSvg />}
            </div>
          )
        })}

        {/* Player car */}
        <motion.div
          className="absolute bottom-12"
          animate={{ left: `${laneXPositions[playerLane]}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ transform: 'translateX(-50%)' }}
        >
          <CarSvg />
        </motion.div>

        {/* Controls hint */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-[10px] text-text-muted/50 uppercase tracking-widest">
            Arrow Keys / A-D to switch lanes
          </span>
        </div>
      </div>
    </motion.div>
  )
}
