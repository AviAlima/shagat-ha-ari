import { useState, useEffect, useCallback, useRef } from 'react'
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

const BASE_SPEED = 0.8
const SNEAKER_SPEED = 1.3
const JUMP_DURATION = 500
const OBSTACLE_WIDTH = 5
const PLAYER_X = 15
const HIT_COOLDOWN = 600

function PlayerSvg({ jumping }: { jumping: boolean }) {
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

export function ShelterRun({ countdown, hasSneakers, onCountdownTick, onReachShelter, onFail }: ShelterRunProps) {
  const speed = hasSneakers ? SNEAKER_SPEED : BASE_SPEED
  const [distance, setDistance] = useState(0)
  const [jumping, setJumping] = useState(false)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [hit, setHit] = useState(false)
  const nextObstacleId = useRef(0)
  const jumpTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const jumpingRef = useRef(false)
  const lastHitTime = useRef(0)
  const reachedRef = useRef(false)
  const shelterCalledRef = useRef(false)

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

        // Collision check (only when not jumping and not in cooldown)
        const now = Date.now()
        if (!jumpingRef.current && now - lastHitTime.current > HIT_COOLDOWN) {
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
    if (jumpingRef.current) return
    setJumping(true)
    jumpingRef.current = true
    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current)
    jumpTimeoutRef.current = setTimeout(() => {
      setJumping(false)
      jumpingRef.current = false
    }, JUMP_DURATION)
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleJump()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleJump])

  // Cleanup jump timeout on unmount
  useEffect(() => {
    return () => {
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current)
    }
  }, [])

  const progressPct = Math.min(100, distance)

  return (
    <div
      className="flex flex-col flex-1 select-none"
      onClick={handleJump}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.code === 'Space') handleJump() }}
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

      {/* Progress bar */}
      <div className="w-full h-1 bg-noir-border">
        <div
          className="h-full bg-neon-green transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Runner scene */}
      <div className={`flex-1 relative overflow-hidden bg-noir-bg transition-colors duration-150`}>
        {/* Background flash on hit */}
        <AnimatePresence>
          {hit && (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-alert-red/20 z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Ceiling line for hallway feel */}
        <div className="absolute top-20 left-0 right-0 h-px bg-noir-border/20" />

        {/* Wall texture - left */}
        <div className="absolute top-20 bottom-16 left-0 w-[5%] bg-noir-surface/30 border-r border-noir-border/20" />
        {/* Wall texture - right */}
        <div className="absolute top-20 bottom-16 right-0 w-[5%] bg-noir-surface/30 border-l border-noir-border/20" />

        {/* Ground with texture pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-noir-surface/50 border-t border-noir-border/40" />
        <div className="absolute bottom-16 left-0 right-0 h-px bg-noir-border" />

        {/* Hallway floor lines for depth/movement */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
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
          className="absolute bottom-16 z-5"
          style={{ left: `${PLAYER_X}%` }}
          animate={{
            y: jumping ? -40 : 0,
            ...(jumping ? {} : { translateY: [0, -2, 0] }),
          }}
          transition={
            jumping
              ? { duration: JUMP_DURATION / 1000, ease: 'easeOut' }
              : { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <PlayerSvg jumping={jumping} />
          {/* Shadow under player */}
          {!jumping && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-noir-border/30 rounded-full blur-[1px]" />
          )}
        </motion.div>

        {/* Obstacles */}
        {obstacles.map(obs => {
          const screenX = obs.x - distance
          if (screenX < -10 || screenX > 110) return null
          return (
            <div
              key={obs.id}
              className="absolute bottom-16"
              style={{ left: `${screenX}%`, transform: 'translateX(-50%)' }}
            >
              <ObstacleSvg type={obs.type} />
            </div>
          )
        })}

        {/* Shelter indicator at the end */}
        {100 - distance < 30 && (
          <motion.div
            className="absolute bottom-16 flex flex-col items-center"
            style={{ left: `${PLAYER_X + (100 - distance)}%` }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="text-xs text-neon-green font-bold mb-1 stat-glow tracking-wider">SHELTER</div>
            <div className="w-10 h-12 border-2 border-neon-green rounded-sm bg-neon-green/10 shadow-[0_0_16px_rgba(0,230,118,0.3)]" />
          </motion.div>
        )}

        {/* Tap instruction — prominent then fading */}
        <motion.div
          className="absolute bottom-4 left-0 right-0 text-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 2 }}
        >
          <span className="text-xs text-text-muted bg-noir-bg/70 px-4 py-1.5 rounded-full border border-noir-border/50 uppercase tracking-widest">
            Tap / Space to jump
          </span>
        </motion.div>
      </div>
    </div>
  )
}
