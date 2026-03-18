import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShelterRunProps {
  countdown: number
  hasSneakers: boolean
  onCountdownTick: () => void
  onReachShelter: () => void
  onFail: () => void
}

interface Obstacle {
  id: number
  x: number
  type: 'box' | 'person' | 'dark'
}

interface SfxText {
  id: number
  word: string
  x: number
  y: number
  rotation: number
}

const BASE_SPEED = 0.8
const SNEAKER_SPEED = 1.3
const JUMP_DURATION = 500
const DUCK_DURATION = 400
const OBSTACLE_WIDTH = 5
const PLAYER_X = 15
const HIT_COOLDOWN = 600

const SFX_WORDS = ['BOOM', 'WHIZ', 'CRACK', 'SHHH']

function PlayerSvg({ jumping, ducking }: { jumping: boolean; ducking: boolean }) {
  if (ducking) {
    return (
      <svg viewBox="0 0 32 24" className="w-10 h-6" fill="none">
        <circle cx="8" cy="10" r="4" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
        <line x1="12" y1="10" x2="24" y2="12" stroke="#e0e0e0" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="14" y2="18" stroke="#e0e0e0" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="20" y2="18" stroke="#e0e0e0" strokeWidth="1.5" />
        <line x1="24" y1="12" x2="22" y2="20" stroke="#e0e0e0" strokeWidth="1.5" />
        <line x1="24" y1="12" x2="28" y2="20" stroke="#e0e0e0" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 48" className="w-8 h-16" fill="none">
      <circle cx="12" cy="6" r="5" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
      <line x1="12" y1="11" x2="12" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="16" x2="4" y2={jumping ? '20' : '24'} stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="16" x2="20" y2={jumping ? '20' : '24'} stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="28" x2="6" y2={jumping ? '36' : '44'} stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="12" y1="28" x2="18" y2={jumping ? '36' : '44'} stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

function ObstacleSvg({ type }: { type: 'box' | 'person' | 'dark' }) {
  if (type === 'box') {
    return (
      <svg viewBox="0 0 20 20" className="w-8 h-8">
        <rect x="2" y="4" width="16" height="14" fill="#1a1a2e" stroke="#ff1744" strokeWidth="1" rx="1" />
        <line x1="2" y1="10" x2="18" y2="10" stroke="#ff174480" strokeWidth="0.5" />
      </svg>
    )
  }
  if (type === 'person') {
    return (
      <svg viewBox="0 0 20 32" className="w-6 h-10">
        <circle cx="10" cy="5" r="4" stroke="#888" strokeWidth="1" fill="#12121a" />
        <line x1="10" y1="9" x2="10" y2="20" stroke="#888" strokeWidth="1" />
        <line x1="10" y1="20" x2="5" y2="30" stroke="#888" strokeWidth="1" />
        <line x1="10" y1="20" x2="15" y2="30" stroke="#888" strokeWidth="1" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 10" className="w-10 h-4">
      <ellipse cx="12" cy="5" rx="11" ry="4" fill="#06060a" opacity="0.8" />
    </svg>
  )
}

// Shelter icon for progress bar end
function ShelterIcon() {
  return (
    <svg viewBox="0 0 16 14" className="w-4 h-3.5" fill="none">
      <path d="M8 1L1 6V13H6V9H10V13H15V6L8 1Z" stroke="#00e676" strokeWidth="1" fill="#00e67620" />
      <rect x="6" y="9" width="4" height="4" fill="#00e67640" />
    </svg>
  )
}

// Precomputed parallax data to avoid recreating on every render
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

function generateDebris() {
  const debris: Array<{ x: number; type: number; size: number }> = []
  for (let i = 0; i < 20; i++) {
    debris.push({
      x: Math.random() * 300,
      type: Math.floor(Math.random() * 3),
      size: Math.random() * 3 + 2,
    })
  }
  return debris
}

export function ShelterRun({ countdown, hasSneakers, onCountdownTick, onReachShelter, onFail }: ShelterRunProps) {
  const speed = hasSneakers ? SNEAKER_SPEED : BASE_SPEED
  const [distance, setDistance] = useState(0)
  const [jumping, setJumping] = useState(false)
  const [ducking, setDucking] = useState(false)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [hit, setHit] = useState(false)
  const [showHud, setShowHud] = useState(true)
  const [sfxTexts, setSfxTexts] = useState<SfxText[]>([])
  const nextObstacleId = useRef(0)
  const jumpTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const duckTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const jumpingRef = useRef(false)
  const duckingRef = useRef(false)
  const lastHitTime = useRef(0)
  const reachedRef = useRef(false)
  const shelterCalledRef = useRef(false)
  const sfxIdRef = useRef(0)

  // Precompute parallax layer data once
  const interceptorStreaks = useMemo(() => generateInterceptorStreaks(), [])
  const flashDots = useMemo(() => generateFlashDots(), [])
  const buildings = useMemo(() => generateBuildings(), [])
  const debrisPieces = useMemo(() => generateDebris(), [])

  // Generate obstacles
  useEffect(() => {
    const initial: Obstacle[] = []
    const types: Array<'box' | 'person' | 'dark'> = ['box', 'person', 'dark']
    for (let i = 0; i < 8; i++) {
      initial.push({
        id: nextObstacleId.current++,
        x: 30 + i * 10 + Math.random() * 5,
        type: types[Math.floor(Math.random() * types.length)],
      })
    }
    setObstacles(initial)
  }, [])

  // Game loop — handles movement + collision in one place
  useEffect(() => {
    const timer = setInterval(() => {
      setDistance(prev => {
        if (reachedRef.current) return prev

        // Collision check (only when not jumping/ducking and not in cooldown)
        const now = Date.now()
        if (!jumpingRef.current && !duckingRef.current && now - lastHitTime.current > HIT_COOLDOWN) {
          for (const obs of obstacles) {
            const obsScreenX = obs.x - prev
            if (Math.abs(obsScreenX - PLAYER_X) < OBSTACLE_WIDTH) {
              lastHitTime.current = now
              setHit(true)
              setTimeout(() => setHit(false), 300)
              return Math.max(0, prev - 2)
            }
          }
        }

        const next = prev + speed
        if (next >= 100 && !reachedRef.current) {
          reachedRef.current = true
        }
        return Math.min(next, 100)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [speed, obstacles])

  // Detect reaching shelter — fire exactly once
  useEffect(() => {
    if (distance >= 100 && reachedRef.current && !shelterCalledRef.current) {
      shelterCalledRef.current = true
      onReachShelter()
    }
  }, [distance, onReachShelter])

  // Countdown continues
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

  const handleJump = useCallback(() => {
    if (jumpingRef.current || duckingRef.current) return
    setJumping(true)
    jumpingRef.current = true
    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current)
    jumpTimeoutRef.current = setTimeout(() => {
      setJumping(false)
      jumpingRef.current = false
    }, JUMP_DURATION)
  }, [])

  const handleDuck = useCallback(() => {
    if (duckingRef.current || jumpingRef.current) return
    setDucking(true)
    duckingRef.current = true
    if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current)
    duckTimeoutRef.current = setTimeout(() => {
      setDucking(false)
      duckingRef.current = false
    }, DUCK_DURATION)
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleJump()
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault()
        handleDuck()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleJump, handleDuck])

  // Fade HUD indicators after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowHud(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Visual SFX — random onomatopoeia every 5-15s
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
        // Remove after animation
        setTimeout(() => {
          setSfxTexts(prev => prev.filter(s => s.id !== id))
        }, 1500)
        timerRef = scheduleNext()
      }, delay)
    }
    let timerRef = scheduleNext()
    return () => clearTimeout(timerRef)
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current)
      if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current)
    }
  }, [])

  const progressPct = Math.min(100, distance)
  const progressGlowIntensity = Math.min(12, 4 + (progressPct / 100) * 8)
  const isBarPulsing = progressPct > 80

  return (
    <div
      className="flex flex-col flex-1 select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.code === 'Space') handleJump(); if (e.code === 'ArrowDown' || e.code === 'KeyS') handleDuck() }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-noir-border">
        <div className="text-xs text-text-muted">
          Distance: <span className="text-neon-green font-bold tabular-nums stat-glow">{Math.round(progressPct)}m</span> / 100m
        </div>
        <div className="text-xs text-text-muted">
          Siren: <span className="text-alert-red font-bold tabular-nums stat-glow">{countdown}s</span>
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className="w-full h-[3px] bg-noir-border relative">
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
        {/* Shelter icon at the right end */}
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2">
          <ShelterIcon />
        </div>
      </div>

      {/* Runner scene */}
      <div
        className={`flex-1 relative overflow-hidden transition-colors duration-150 ${hit ? 'animate-screen-shake' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0010 100%)',
          filter: hit ? 'saturate(0.3)' : 'saturate(1)',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* === PARALLAX LAYER 3 (back): Night sky + interceptor streaks === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Interceptor trail streaks — scroll at 0.2x */}
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
            {/* Interception flash dots */}
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
        <div className="absolute bottom-16 left-0 right-0 h-24 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <svg
            className="absolute bottom-0 w-[200%] h-full"
            viewBox="0 0 250 50"
            preserveAspectRatio="none"
            style={{ transform: `translateX(${-(distance * 0.5) % 125}px)` }}
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

        {/* === PARALLAX LAYER 1 (front): Ground debris === */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
          <svg
            className="absolute bottom-0 w-[300%] h-full"
            viewBox="0 0 300 16"
            preserveAspectRatio="none"
            style={{ transform: `translateX(${-(distance * 1.0) % 150}px)` }}
          >
            {debrisPieces.map((d, i) => {
              if (d.type === 0) {
                // Paper scrap
                return (
                  <rect
                    key={`deb-${i}`}
                    x={d.x}
                    y={12 - d.size}
                    width={d.size * 1.2}
                    height={d.size * 0.8}
                    fill="none"
                    stroke="rgba(42,42,62,0.3)"
                    strokeWidth="0.3"
                    transform={`rotate(${i * 23}, ${d.x}, ${12 - d.size})`}
                  />
                )
              }
              if (d.type === 1) {
                // Rock
                return (
                  <circle
                    key={`deb-${i}`}
                    cx={d.x}
                    cy={13}
                    r={d.size * 0.4}
                    fill="rgba(42,42,62,0.25)"
                  />
                )
              }
              // Broken glass shard
              return (
                <polygon
                  key={`deb-${i}`}
                  points={`${d.x},${14} ${d.x + d.size * 0.5},${14 - d.size} ${d.x + d.size},${14}`}
                  fill="none"
                  stroke="rgba(68,138,255,0.15)"
                  strokeWidth="0.2"
                />
              )
            })}
          </svg>
        </div>

        {/* Background flash on hit */}
        <AnimatePresence>
          {hit && (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-alert-red/20 pointer-events-none"
              style={{ zIndex: 10 }}
            />
          )}
        </AnimatePresence>

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

        {/* Ground with texture pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-noir-surface/50 border-t border-noir-border/40" style={{ zIndex: 3 }} />
        <div className="absolute bottom-16 left-0 right-0 h-px bg-noir-border" style={{ zIndex: 3 }} />

        {/* Hallway floor lines for depth/movement */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden" style={{ zIndex: 3 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-px h-16 bg-noir-border/20"
              style={{ left: `${((i * 6 - (distance * 4) % 150 + 150) % 150)}%` }}
            />
          ))}
          {/* Horizontal floor lines */}
          <div className="absolute bottom-4 left-0 right-0 h-px bg-noir-border/15" />
          <div className="absolute bottom-8 left-0 right-0 h-px bg-noir-border/10" />
          <div className="absolute bottom-12 left-0 right-0 h-px bg-noir-border/5" />
        </div>

        {/* Player with subtle bobble while running */}
        <motion.div
          className="absolute bottom-16"
          style={{ left: `${PLAYER_X}%`, zIndex: 5 }}
          animate={{
            y: jumping ? -40 : ducking ? 8 : 0,
            ...(jumping || ducking ? {} : { translateY: [0, -2, 0] }),
          }}
          transition={
            jumping
              ? { duration: JUMP_DURATION / 1000, ease: 'easeOut' }
              : ducking
                ? { duration: DUCK_DURATION / 1000, ease: 'easeOut' }
                : { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <PlayerSvg jumping={jumping} ducking={ducking} />
          {/* Shadow under player */}
          {!jumping && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-noir-border/30 rounded-full blur-[1px]" />
          )}
        </motion.div>

        {/* Touch zones overlay */}
        <div className="absolute inset-0 flex pointer-events-auto" style={{ zIndex: 20 }}>
          <div className="flex-1" onTouchStart={handleDuck} />
          <div className="flex-1" onTouchStart={handleJump} />
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => {
          const screenX = obs.x - distance
          if (screenX < -10 || screenX > 110) return null
          return (
            <div
              key={obs.id}
              className="absolute bottom-16"
              style={{ left: `${screenX}%`, transform: 'translateX(-50%)', zIndex: 4 }}
            >
              <ObstacleSvg type={obs.type} />
            </div>
          )
        })}

        {/* Shelter indicator at the end */}
        {100 - distance < 30 && (
          <motion.div
            className="absolute bottom-16 flex flex-col items-center"
            style={{ left: `${PLAYER_X + (100 - distance)}%`, zIndex: 4 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="text-xs text-neon-green font-bold mb-1 stat-glow tracking-wider">SHELTER</div>
            <div className="w-10 h-12 border-2 border-neon-green rounded-sm bg-neon-green/10 shadow-[0_0_16px_rgba(0,230,118,0.3)]" />
          </motion.div>
        )}

        {/* Touch HUD indicators — fade after 3s */}
        <motion.div
          className="absolute bottom-4 left-0 right-0 flex justify-between px-6 pointer-events-none"
          style={{ zIndex: 30 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: showHud ? 0.8 : 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-xs text-text-muted bg-noir-bg/70 px-3 py-1.5 rounded-full border border-noir-border/50 uppercase tracking-widest">
            &#9664; Slide
          </span>
          <span className="text-xs text-text-muted bg-noir-bg/70 px-3 py-1.5 rounded-full border border-noir-border/50 uppercase tracking-widest">
            Jump &#9654;
          </span>
        </motion.div>
      </div>
    </div>
  )
}
