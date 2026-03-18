import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
const SPEED_KM_PER_TICK = 0.05 // ~1km/s at 50ms ticks
const SIREN_REACTION_TIME = 2000
const SIREN_WAIT_TIME = 5000
const SIREN_INTERVAL_MIN = 12000
const SIREN_INTERVAL_MAX = 22000
const SANITY_DAMAGE = 20

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
    <svg viewBox="0 0 30 60" className="w-10 h-14" fill="none">
      <rect x="5" y="8" width="20" height="34" rx="4" fill="#0e0e16" stroke="#ff174460" strokeWidth="1" />
      {/* Headlight glow halos */}
      <circle cx="9" cy="9" r="5" fill="#ffab0030" />
      <circle cx="21" cy="9" r="5" fill="#ffab0030" />
      {/* Headlights */}
      <rect x="7" y="7" width="4" height="3" rx="1" fill="#ffab00" opacity="0.8" />
      <rect x="19" y="7" width="4" height="3" rx="1" fill="#ffab00" opacity="0.8" />
      {/* Headlight beam glow */}
      <ellipse cx="9" cy="4" rx="3" ry="2" fill="#ffab0020" />
      <ellipse cx="21" cy="4" rx="3" ry="2" fill="#ffab0020" />
      {/* Taillights */}
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

// Skyline building data — static so it does not regenerate on re-render
const SKYLINE_BUILDINGS = Array.from({ length: 18 }, (_, i) => ({
  x: i * 6,
  w: 3 + (i * 7 + 3) % 4,
  h: 15 + (i * 13 + 7) % 30,
}))

type SirenState = 'none' | 'active' | 'stopped' | 'clear'

export function DrivingGame({ sanity, onSanityChange, onComplete, onFail }: DrivingGameProps) {
  const [playerLane, setPlayerLane] = useState(1) // 0, 1, 2
  const [distance, setDistance] = useState(0)
  const [obstacles, setObstacles] = useState<RoadObstacle[]>([])
  const [screenDim, setScreenDim] = useState(false)
  const [sirenState, setSirenState] = useState<SirenState>('none')
  const [screenShake, setScreenShake] = useState(false)
  const [hudVisible, setHudVisible] = useState(true)
  const sirenStartTimeRef = useRef(0)
  const [sirenCountdown, setSirenCountdown] = useState(1)

  const [collisionFlash, setCollisionFlash] = useState(false)

  const nextObsId = useRef(0)
  const sirenTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const clearTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const distanceRef = useRef(distance)
  distanceRef.current = distance
  const playerLaneRef = useRef(playerLane)
  playerLaneRef.current = playerLane
  const sirenStateRef = useRef(sirenState)
  sirenStateRef.current = sirenState
  const completedRef = useRef(false)
  const lastCollisionTime = useRef(0)

  // Fade HUD arrows after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setHudVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Siren countdown animation
  useEffect(() => {
    if (sirenState === 'active') {
      const startTime = Date.now()
      sirenStartTimeRef.current = startTime
      setSirenCountdown(1)
      const interval = setInterval(() => {
        const elapsed = Date.now() - sirenStartTimeRef.current
        const remaining = Math.max(0, 1 - elapsed / SIREN_REACTION_TIME)
        setSirenCountdown(remaining)
        if (remaining <= 0) clearInterval(interval)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [sirenState])

  // Generate obstacles on mount
  useEffect(() => {
    const initial: RoadObstacle[] = []
    const types: Array<'car' | 'debris' | 'dark'> = ['car', 'debris', 'dark']
    for (let i = 0; i < 25; i++) {
      initial.push({
        id: nextObsId.current++,
        lane: Math.floor(Math.random() * LANE_COUNT),
        y: 10 + i * 4 + Math.random() * 3,
        type: types[Math.floor(Math.random() * types.length)],
      })
    }
    setObstacles(initial)
  }, [])

  // Game loop — drive forward + collision detection
  useEffect(() => {
    if (sirenState === 'active' || sirenState === 'stopped') return
    const timer = setInterval(() => {
      setDistance(prev => {
        const next = prev + SPEED_KM_PER_TICK

        // Collision detection — check if player lane matches any nearby obstacle
        const now = Date.now()
        if (now - lastCollisionTime.current > 800) {
          const scrollUnit = TOTAL_DISTANCE / 60
          for (const obs of obstacles) {
            if (obs.type === 'dark') continue // dark patches don't cause collision
            const relY = obs.y - next / scrollUnit
            // Hit zone: obstacle is near the player's car position (bottom of screen)
            if (relY > -0.5 && relY < 1.2 && obs.lane === playerLaneRef.current) {
              lastCollisionTime.current = now
              // Collision! Slow down + sanity damage
              onSanityChange(p => p - 10)
              setScreenShake(true)
              setCollisionFlash(true)
              setTimeout(() => { setScreenShake(false); setCollisionFlash(false) }, 400)
              return Math.max(0, prev - 1) // knocked back slightly
            }
          }
        }

        if (next >= TOTAL_DISTANCE && !completedRef.current) {
          completedRef.current = true
          setTimeout(() => onComplete(), 100)
        }
        return Math.min(next, TOTAL_DISTANCE)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [sirenState, onComplete, obstacles, onSanityChange])

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

  // Touch handlers for lane switching
  const handleMoveLeft = useCallback(() => {
    setPlayerLane(prev => Math.max(0, prev - 1))
  }, [])

  const handleMoveRight = useCallback(() => {
    setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1))
  }, [])

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

  const leftSideHeights = useMemo(() =>
    Array.from({ length: 6 }, () => 15 + Math.random() * 10), [])
  const rightSideHeights = useMemo(() =>
    Array.from({ length: 6 }, () => 12 + Math.random() * 10), [])

  const progressPct = Math.min(100, (distance / TOTAL_DISTANCE) * 100)
  const laneXPositions = [20, 50, 80] // percentage positions for 3 lanes

  // Estimated time to arrival: distance remaining / speed per second
  // Speed = SPEED_KM_PER_TICK * (1000/50) = 2 km/s
  const speedKmPerSec = SPEED_KM_PER_TICK * 20
  const remainingDist = Math.max(0, TOTAL_DISTANCE - distance)
  const etaSeconds = Math.ceil(remainingDist / speedKmPerSec)

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

      {/* Siren overlay — red tinted with backdrop blur */}
      <AnimatePresence>
        {sirenState === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,23,68,0.25) 0%, rgba(255,23,68,0.4) 100%)' }}
          />
        )}
      </AnimatePresence>

      {/* Siren message — full screen overlay, unmissable, tappable on mobile */}
      <AnimatePresence>
        {sirenState === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-alert-red/20 backdrop-blur-sm"
            onClick={handleSirenStop}
            onTouchStart={handleSirenStop}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-alert-red/60 bg-noir-bg/90 shadow-[0_0_80px_rgba(255,23,68,0.5)]"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="text-4xl md:text-5xl font-bold text-alert-red animate-pulse-red px-4 py-2 text-center"
              >
                STOP! GET OUT!
              </motion.div>
              {/* Countdown bar */}
              <div className="w-48 h-2 bg-noir-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-alert-red rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: SIREN_REACTION_TIME / 1000, ease: 'linear' }}
                />
              </div>
              <span className="text-xs text-text-muted/70 uppercase tracking-wider">
                {Math.ceil(sirenCountdown * SIREN_REACTION_TIME / 1000)}s to react
              </span>
              <span className="text-sm text-text-muted">Press SPACE or tap to stop and lie flat</span>
            </motion.div>
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
        <div className="flex flex-col">
          <div className="text-sm md:text-base text-text-primary">
            <span className="text-neon-green font-bold tabular-nums stat-glow text-lg md:text-xl">{Math.round(distance)}km</span>
            <span className="text-text-muted text-xs ml-1">/ {TOTAL_DISTANCE}km</span>
          </div>
          <div className="text-[10px] text-text-muted tabular-nums">
            ~{etaSeconds}s to parents
          </div>
        </div>
        <div className="text-xs text-text-muted">
          Route 1 — <span className="text-neon-amber">Heading to Parents</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-noir-border z-10">
        <div
          className="h-full bg-neon-green transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Collision flash */}
      <AnimatePresence>
        {collisionFlash && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-alert-red/20 z-[25] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Road scene */}
      <div className="flex-1 relative overflow-hidden bg-noir-bg">
        {/* Touch zones for lane switching */}
        <div className="absolute inset-0 flex z-[15]">
          <div
            className="flex-1"
            onTouchStart={handleMoveLeft}
          />
          <div className="flex-1" />
          <div
            className="flex-1"
            onTouchStart={handleMoveRight}
          />
        </div>

        {/* Parallax city skyline background */}
        <div className="absolute inset-x-0 top-0 h-[25%] overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              transform: `translateX(${-(distance * 0.3) % 50}px)`,
            }}
          >
            {SKYLINE_BUILDINGS.map((b, i) => (
              <div
                key={`sky-${i}`}
                className="absolute bottom-0"
                style={{
                  left: `${b.x}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                  background: 'linear-gradient(to top, #0e0e16, #12121a)',
                  borderTop: '1px solid #2a2a3e20',
                  borderLeft: '1px solid #2a2a3e15',
                  borderRight: '1px solid #2a2a3e15',
                }}
              >
                {/* Window dots */}
                {b.h > 25 && Array.from({ length: Math.floor(b.h / 12) }).map((_, wi) => (
                  <div
                    key={wi}
                    className="absolute"
                    style={{
                      left: '30%',
                      top: `${15 + wi * 25}%`,
                      width: '40%',
                      height: '3px',
                      background: (i + wi) % 3 === 0 ? '#ffab0015' : '#448aff08',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Road surface with subtle gradient */}
        <div className="absolute inset-x-[10%] inset-y-0 bg-noir-surface border-l-2 border-r-2 border-noir-border">
          {/* Road edge markings — solid amber/yellow lines */}
          <div className="absolute inset-y-0 left-0 w-1 bg-neon-amber/25" />
          <div className="absolute inset-y-0 right-0 w-1 bg-neon-amber/25" />
          {/* Road edge glow */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-neon-amber/10 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-neon-amber/10 to-transparent" />
        </div>

        {/* Center dashed line */}
        <div className="absolute inset-y-0" style={{ left: '50%' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`center-${i}`}
              className="absolute w-0.5 h-6 bg-neon-amber/20 rounded-full"
              style={{
                top: `${((i * 7 - ((distance * 8) % 140) + 140) % 140) - 10}%`,
              }}
            />
          ))}
        </div>

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
                height: `${leftSideHeights[i]}%`,
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
                height: `${rightSideHeights[i]}%`,
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
              {obs.type === 'car' && (
                <div className="relative">
                  <ObstacleCarSvg />
                  {/* Headlight ground glow */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full"
                    style={{ background: 'radial-gradient(ellipse, rgba(255,171,0,0.2) 0%, transparent 70%)' }}
                  />
                </div>
              )}
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

        {/* Touch HUD arrows — fade after 3s */}
        <motion.div
          className="absolute bottom-3 left-0 right-0 flex justify-between px-4 z-20 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: hudVisible ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-sm text-text-muted/40 bg-noir-bg/50 px-3 py-1 rounded-full border border-noir-border/30">
            &#9664;
          </span>
          <span className="text-[10px] text-text-muted/30 self-center uppercase tracking-widest">
            Lane {playerLane + 1}
          </span>
          <span className="text-sm text-text-muted/40 bg-noir-bg/50 px-3 py-1 rounded-full border border-noir-border/30">
            &#9654;
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
