import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface LootCrate {
  id: number
  position: number
  reward: { type: 'cash' | 'sanity' | 'supplies'; amount: number }
  grabbed: boolean
}

interface ShelterRunProps {
  countdown: number
  hasSneakers: boolean
  onCountdownTick: () => void
  onReachShelter: () => void
  onFail: () => void
  onLootGrabbed: (reward: { type: 'cash' | 'sanity' | 'supplies'; amount: number }) => void
}

interface Obstacle {
  id: number
  lane: number
  y: number // 0-100 distance along the path
  type: 'person' | 'debris' | 'dark'
}

interface SfxText {
  id: number
  word: string
  x: number
  y: number
  rotation: number
}

const LANE_COUNT = 3
const TOTAL_DISTANCE = 100
const BASE_SPEED = 0.65
const SNEAKER_SPEED = 0.9
const HIT_COOLDOWN = 500
const HIT_KNOCKBACK = 3
const GRAB_DURATION = 2000
const CRATE_PROXIMITY = 3
const OBSTACLE_COUNT = 11

const SFX_WORDS = ['BOOM', 'WHIZ', 'CRACK', 'SHHH']

function PlayerSvg() {
  return (
    <svg viewBox="0 0 24 32" className="w-8 h-10" fill="none">
      {/* Head (top-down, facing up) */}
      <circle cx="12" cy="8" r="5" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
      {/* Body line */}
      <line x1="12" y1="13" x2="12" y2="24" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Arms */}
      <line x1="12" y1="16" x2="5" y2="19" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="16" x2="19" y2="19" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Legs */}
      <line x1="12" y1="24" x2="7" y2="30" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="24" x2="17" y2="30" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

function NeighborSvg() {
  return (
    <svg viewBox="0 0 24 32" className="w-8 h-10" fill="none">
      <circle cx="12" cy="8" r="5" stroke="#888" strokeWidth="1" fill="#12121a" />
      <line x1="12" y1="13" x2="12" y2="22" stroke="#888" strokeWidth="1" />
      <line x1="12" y1="22" x2="6" y2="30" stroke="#888" strokeWidth="1" />
      <line x1="12" y1="22" x2="18" y2="30" stroke="#888" strokeWidth="1" />
      {/* Arms raised in panic */}
      <line x1="12" y1="16" x2="4" y2="10" stroke="#888" strokeWidth="1" />
      <line x1="12" y1="16" x2="20" y2="10" stroke="#888" strokeWidth="1" />
    </svg>
  )
}

function DebrisSvg() {
  return (
    <svg viewBox="0 0 30 20" className="w-10 h-6" fill="none">
      <polygon points="5,18 12,4 20,16 28,8 25,18" fill="#1a1a2e" stroke="#ff174440" strokeWidth="1" />
      <line x1="8" y1="14" x2="15" y2="8" stroke="#ff174430" strokeWidth="0.5" />
      <polygon points="2,16 8,10 14,18" fill="#1a1a2e" stroke="#ff174430" strokeWidth="0.5" />
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

function ShelterIcon() {
  return (
    <svg viewBox="0 0 16 14" className="w-4 h-3.5" fill="none">
      <path d="M8 1L1 6V13H6V9H10V13H15V6L8 1Z" stroke="#00e676" strokeWidth="1" fill="#00e67620" />
      <rect x="6" y="9" width="4" height="4" fill="#00e67640" />
    </svg>
  )
}

// Precomputed parallax data
function generateInterceptorStreaks() {
  const streaks: Array<{ x: number; y: number; length: number; angle: number }> = []
  for (let i = 0; i < 12; i++) {
    streaks.push({
      x: Math.random() * 200,
      y: Math.random() * 60 + 5,
      length: Math.random() * 15 + 5,
      angle: Math.random() * 40 - 20,
    })
  }
  return streaks
}

function generateFlashDots() {
  const dots: Array<{ x: number; y: number; delay: number }> = []
  for (let i = 0; i < 6; i++) {
    dots.push({
      x: Math.random() * 200,
      y: Math.random() * 40 + 10,
      delay: Math.random() * 4,
    })
  }
  return dots
}

function generateBuildings() {
  const buildings: Array<{ x: number; width: number; height: number }> = []
  let bx = 0
  while (bx < 250) {
    const w = Math.random() * 10 + 6
    const h = Math.random() * 25 + 10
    buildings.push({ x: bx, width: w, height: h })
    bx += w + Math.random() * 4 + 1
  }
  return buildings
}

const LANE_X_POSITIONS = [20, 50, 80]

export function ShelterRun({ countdown, hasSneakers, onCountdownTick, onReachShelter, onFail, onLootGrabbed }: ShelterRunProps) {
  const speed = hasSneakers ? SNEAKER_SPEED : BASE_SPEED
  const [playerLane, setPlayerLane] = useState(1)
  const [distance, setDistance] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [collisionFlash, setCollisionFlash] = useState(false)
  const [screenDim, setScreenDim] = useState(false)
  const [showHud, setShowHud] = useState(true)
  const [sfxTexts, setSfxTexts] = useState<SfxText[]>([])
  const [crates, setCrates] = useState<LootCrate[]>([])
  const [grabbing, setGrabbing] = useState(false)
  const [grabPrompt, setGrabPrompt] = useState<LootCrate | null>(null)

  const grabbingRef = useRef(false)
  const cratesRef = useRef<LootCrate[]>([])
  const grabPromptRef = useRef<LootCrate | null>(null)
  const playerLaneRef = useRef(playerLane)
  const distanceRef = useRef(distance)
  const nextObstacleId = useRef(0)
  const lastHitTime = useRef(0)
  const reachedRef = useRef(false)
  const shelterCalledRef = useRef(false)
  const sfxIdRef = useRef(0)

  // Keep refs in sync
  cratesRef.current = crates
  grabPromptRef.current = grabPrompt
  playerLaneRef.current = playerLane
  distanceRef.current = distance

  // Precompute parallax data once
  const interceptorStreaks = useMemo(() => generateInterceptorStreaks(), [])
  const flashDots = useMemo(() => generateFlashDots(), [])
  const buildings = useMemo(() => generateBuildings(), [])

  const leftWallHeights = useMemo(() =>
    Array.from({ length: 6 }, () => 15 + Math.random() * 10), [])
  const rightWallHeights = useMemo(() =>
    Array.from({ length: 6 }, () => 12 + Math.random() * 10), [])

  // Generate obstacles and loot crates on mount
  useEffect(() => {
    const initial: Obstacle[] = []
    const types: Array<'person' | 'debris' | 'dark'> = ['person', 'debris', 'dark']
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      initial.push({
        id: nextObstacleId.current++,
        lane: Math.floor(Math.random() * LANE_COUNT),
        y: 8 + i * 8 + Math.random() * 5,
        type: types[Math.floor(Math.random() * types.length)],
      })
    }
    setObstacles(initial)

    const cratePositions = [25 + Math.random() * 10, 50 + Math.random() * 10, 75 + Math.random() * 10]
    const rewardTypes: Array<'cash' | 'sanity' | 'supplies'> = ['cash', 'sanity', 'supplies']
    const newCrates: LootCrate[] = cratePositions.map((pos, i) => ({
      id: i,
      position: pos,
      reward: { type: rewardTypes[i], amount: rewardTypes[i] === 'cash' ? 15 + Math.floor(Math.random() * 10) : 8 },
      grabbed: false,
    }))
    setCrates(newCrates)
  }, [])

  // Game loop — movement + collision
  useEffect(() => {
    const timer = setInterval(() => {
      setDistance(prev => {
        if (reachedRef.current) return prev

        const effectiveSpeed = grabbingRef.current ? 0 : speed
        const next = prev + effectiveSpeed

        // Collision detection
        const now = Date.now()
        if (now - lastHitTime.current > HIT_COOLDOWN) {
          const scrollUnit = TOTAL_DISTANCE / 60
          for (const obs of obstacles) {
            if (obs.type === 'dark') continue
            const relY = obs.y - next / scrollUnit
            if (relY > -0.5 && relY < 1.2 && obs.lane === playerLaneRef.current) {
              lastHitTime.current = now
              setScreenShake(true)
              setCollisionFlash(true)
              setTimeout(() => { setScreenShake(false); setCollisionFlash(false) }, 400)
              return Math.max(0, prev - HIT_KNOCKBACK)
            }
          }
        }

        // Loot crate proximity
        for (const crate of cratesRef.current) {
          if (!crate.grabbed && Math.abs(next - crate.position) < CRATE_PROXIMITY && !grabPromptRef.current) {
            setGrabPrompt(crate)
            const crateId = crate.id
            setTimeout(() => {
              if (grabPromptRef.current?.id === crateId) {
                setGrabPrompt(null)
              }
            }, 1500)
            break
          }
        }

        if (next >= TOTAL_DISTANCE && !reachedRef.current) {
          reachedRef.current = true
        }
        return Math.min(next, TOTAL_DISTANCE)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [speed, obstacles])

  // Fire onReachShelter exactly once
  useEffect(() => {
    if (distance >= TOTAL_DISTANCE && reachedRef.current && !shelterCalledRef.current) {
      shelterCalledRef.current = true
      onReachShelter()
    }
  }, [distance, onReachShelter])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      onCountdownTick()
    }, 1000)
    return () => clearInterval(timer)
  }, [onCountdownTick])

  // Check fail
  useEffect(() => {
    if (countdown <= 0) {
      onFail()
    }
  }, [countdown, onFail])

  // Dark patch dim effect
  useEffect(() => {
    const checkDim = () => {
      const scrollUnit = TOTAL_DISTANCE / 60
      for (const obs of obstacles) {
        if (obs.type === 'dark') {
          const relY = obs.y - distanceRef.current / scrollUnit
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

  // Lane switching handlers
  const handleMoveLeft = useCallback(() => {
    setPlayerLane(prev => Math.max(0, prev - 1))
  }, [])

  const handleMoveRight = useCallback(() => {
    setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1))
  }, [])

  const handleGrab = useCallback(() => {
    if (!grabPromptRef.current || grabbingRef.current) return
    const crate = grabPromptRef.current
    setGrabbing(true)
    grabbingRef.current = true
    setGrabPrompt(null)

    setCrates(prev => prev.map(c => c.id === crate.id ? { ...c, grabbed: true } : c))
    onLootGrabbed(crate.reward)

    setTimeout(() => {
      setGrabbing(false)
      grabbingRef.current = false
    }, GRAB_DURATION)
  }, [onLootGrabbed])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setPlayerLane(prev => Math.max(0, prev - 1))
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1))
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        handleGrab()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleGrab])

  // Fade HUD after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowHud(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Visual SFX onomatopoeia
  useEffect(() => {
    const scheduleNext = () => {
      const delay = (Math.random() * 10 + 5) * 1000
      return setTimeout(() => {
        const id = sfxIdRef.current++
        const word = SFX_WORDS[Math.floor(Math.random() * SFX_WORDS.length)]
        const newSfx: SfxText = {
          id,
          word,
          x: Math.random() * 60 + 10,
          y: Math.random() * 30 + 10,
          rotation: Math.random() * 20 - 10,
        }
        setSfxTexts(prev => [...prev, newSfx])
        setTimeout(() => {
          setSfxTexts(prev => prev.filter(s => s.id !== id))
        }, 1500)
        timerRef = scheduleNext()
      }, delay)
    }
    let timerRef = scheduleNext()
    return () => clearTimeout(timerRef)
  }, [])

  const progressPct = Math.min(100, distance)
  const progressGlowIntensity = Math.min(12, 4 + (progressPct / 100) * 8)
  const isBarPulsing = progressPct > 80
  const scrollUnit = TOTAL_DISTANCE / 60

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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-noir-border z-10">
        <div className="text-xs text-text-muted">
          Distance: <span className="text-neon-green font-bold tabular-nums stat-glow">{Math.round(progressPct)}m</span> / 100m
        </div>
        <div className="text-xs text-text-muted">
          Siren: <span className="text-alert-red font-bold tabular-nums stat-glow">{countdown}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[3px] bg-noir-border relative z-10">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progressPct}%`,
            backgroundColor: isBarPulsing ? '#ff1744' : '#00e676',
            boxShadow: isBarPulsing
              ? `0 0 ${progressGlowIntensity}px #ff1744, 0 0 ${progressGlowIntensity * 2}px #ff174480`
              : `0 0 ${progressGlowIntensity}px #00e676, 0 0 ${progressGlowIntensity * 2}px #00e67680`,
            animation: isBarPulsing ? 'progress-pulse 0.8s ease-in-out infinite' : 'none',
          }}
        />
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2">
          <ShelterIcon />
        </div>
      </div>

      {/* Hallway scene */}
      <div className="flex-1 relative overflow-hidden bg-noir-bg">
        {/* Touch zones for lane switching */}
        <div className="absolute inset-0 flex z-[15]">
          <div className="flex-1" onTouchStart={handleMoveLeft} />
          <div className="flex-1" />
          <div className="flex-1" onTouchStart={handleMoveRight} />
        </div>

        {/* === PARALLAX LAYER 3 (back): Night sky + interceptor streaks === */}
        <div className="absolute inset-x-0 top-0 h-[20%] overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {interceptorStreaks.map((s, i) => {
              const offset = (s.x - distance * 0.2) % 200
              const cx = ((offset % 200) + 200) % 200 - 50
              const rad = (s.angle * Math.PI) / 180
              const dx = Math.cos(rad) * s.length
              const dy = Math.sin(rad) * s.length
              return (
                <line
                  key={`streak-${i}`}
                  x1={cx}
                  y1={s.y}
                  x2={cx + dx}
                  y2={s.y + dy}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="0.15"
                />
              )
            })}
            {flashDots.map((d, i) => {
              const offset = (d.x - distance * 0.2) % 200
              const cx = ((offset % 200) + 200) % 200 - 50
              return (
                <circle
                  key={`flash-${i}`}
                  cx={cx}
                  cy={d.y}
                  r="0.6"
                  fill="#ff6b35"
                  opacity={0.4}
                >
                  <animate
                    attributeName="opacity"
                    values="0;0.7;0"
                    dur={`${2 + d.delay}s`}
                    repeatCount="indefinite"
                    begin={`${d.delay}s`}
                  />
                  <animate
                    attributeName="r"
                    values="0.3;0.8;0.3"
                    dur={`${2 + d.delay}s`}
                    repeatCount="indefinite"
                    begin={`${d.delay}s`}
                  />
                </circle>
              )
            })}
          </svg>
        </div>

        {/* === PARALLAX LAYER 2 (middle): City silhouette === */}
        <div className="absolute inset-x-0 top-0 h-[25%] overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <div
            className="absolute inset-0"
            style={{ transform: `translateX(${-(distance * 0.3) % 50}px)` }}
          >
            <svg
              className="absolute bottom-0 w-[200%] h-full"
              viewBox="0 0 250 50"
              preserveAspectRatio="none"
            >
              {buildings.map((b, i) => (
                <rect
                  key={`bld-${i}`}
                  x={b.x}
                  y={50 - b.height}
                  width={b.width}
                  height={b.height}
                  fill="#0d0d15"
                  stroke="#1a1a2e"
                  strokeWidth="0.2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Hallway floor surface */}
        <div className="absolute inset-x-[10%] inset-y-0 bg-noir-surface border-l-2 border-r-2 border-noir-border">
          {/* Wall edge markings */}
          <div className="absolute inset-y-0 left-0 w-1 bg-neon-amber/15" />
          <div className="absolute inset-y-0 right-0 w-1 bg-neon-amber/15" />
          {/* Wall edge glow */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-neon-amber/10 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-neon-amber/10 to-transparent" />
        </div>

        {/* Lane markings — animated scrolling dashes */}
        {[35, 65].map((x) => (
          <div key={x} className="absolute inset-y-0" style={{ left: `${x}%` }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-8 bg-neon-amber/20"
                style={{
                  top: `${((i * 10 - ((distance * 8) % 120) + 120) % 120) - 10}%`,
                }}
              />
            ))}
          </div>
        ))}

        {/* Hallway walls — left */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-noir-card border-r border-noir-border"
              style={{
                left: 0,
                right: 0,
                height: `${leftWallHeights[i]}%`,
                top: `${((i * 20 - ((distance * 3) % 120) + 120) % 120) - 10}%`,
              }}
            />
          ))}
        </div>

        {/* Hallway walls — right */}
        <div className="absolute right-0 top-0 bottom-0 w-[10%] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-noir-card border-l border-noir-border"
              style={{
                left: 0,
                right: 0,
                height: `${rightWallHeights[i]}%`,
                top: `${((i * 22 - ((distance * 3) % 132) + 132) % 132) - 10}%`,
              }}
            />
          ))}
        </div>

        {/* Visual SFX onomatopoeia */}
        <AnimatePresence>
          {sfxTexts.map(sfx => (
            <motion.div
              key={sfx.id}
              className="absolute pointer-events-none font-bold"
              style={{
                left: `${sfx.x}%`,
                top: `${sfx.y}%`,
                zIndex: 8,
                color: sfx.word === 'BOOM' || sfx.word === 'CRACK' ? '#ff1744' : '#ffab00',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-mono)',
                textShadow: '0 0 8px currentColor',
                transform: `rotate(${sfx.rotation}deg)`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.2, 1], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              {sfx.word}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Obstacles scrolling toward the player */}
        {obstacles.map(obs => {
          const relY = obs.y - distance / scrollUnit
          if (relY < -3 || relY > 12) return null
          const screenY = 90 - relY * 8
          const screenX = LANE_X_POSITIONS[obs.lane]
          return (
            <div
              key={obs.id}
              className="absolute"
              style={{
                left: `${screenX}%`,
                top: `${screenY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
              }}
            >
              {obs.type === 'person' && <NeighborSvg />}
              {obs.type === 'debris' && <DebrisSvg />}
              {obs.type === 'dark' && <DarkPatchSvg />}
            </div>
          )
        })}

        {/* Loot crates */}
        {crates.filter(c => !c.grabbed).map(crate => {
          const relY = crate.position / scrollUnit - distance / scrollUnit
          if (relY < -3 || relY > 12) return null
          const screenY = 90 - relY * 8
          return (
            <motion.div
              key={`crate-${crate.id}`}
              className="absolute"
              style={{
                left: `${LANE_X_POSITIONS[1]}%`,
                top: `${screenY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 6,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg viewBox="0 0 20 20" className="w-8 h-8">
                <rect x="2" y="4" width="16" height="14" fill="#1a1a2e" stroke="#ffab00" strokeWidth="1.5" rx="2" />
                <text x="10" y="13" textAnchor="middle" fill="#ffab00" fontSize="8">?</text>
              </svg>
            </motion.div>
          )
        })}

        {/* Shelter door indicator when close */}
        {distance > 70 && (
          <motion.div
            className="absolute flex flex-col items-center"
            style={{
              left: `${LANE_X_POSITIONS[1]}%`,
              top: `${90 - ((TOTAL_DISTANCE / scrollUnit - distance / scrollUnit) * 8)}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 4,
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="text-xs text-neon-green font-bold mb-1 stat-glow tracking-wider">SHELTER</div>
            <div className="w-10 h-12 border-2 border-neon-green rounded-sm bg-neon-green/10 shadow-[0_0_16px_rgba(0,230,118,0.3)]" />
          </motion.div>
        )}

        {/* Player character at bottom */}
        <motion.div
          className="absolute bottom-[15%]"
          animate={{ left: `${LANE_X_POSITIONS[playerLane]}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ transform: 'translateX(-50%)', zIndex: 5 }}
        >
          <motion.div
            animate={{ translateY: [0, -2, 0] }}
            transition={{ duration: 0.25, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PlayerSvg />
          </motion.div>
          {/* Shadow under player */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-noir-border/30 rounded-full blur-[1px]" />
        </motion.div>

        {/* Grab prompt */}
        <AnimatePresence>
          {grabPrompt && (
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <button
                onClick={handleGrab}
                onTouchStart={handleGrab}
                className="px-4 py-2 bg-neon-amber/90 text-noir-bg font-bold text-sm rounded-lg cursor-pointer animate-pulse"
              >
                TAP TO GRAB &mdash; {grabPrompt.reward.type === 'cash' ? `+\u20AA${grabPrompt.reward.amount}` : `+${grabPrompt.reward.amount} ${grabPrompt.reward.type}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grabbing indicator */}
        {grabbing && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30">
            <span className="px-4 py-2 bg-neon-amber/70 text-noir-bg font-bold text-sm rounded-lg animate-pulse">
              Grabbing...
            </span>
          </div>
        )}

        {/* Touch HUD arrows — fade after 3s */}
        <motion.div
          className="absolute bottom-3 left-0 right-0 flex justify-between px-4 z-20 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: showHud ? 1 : 0 }}
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
