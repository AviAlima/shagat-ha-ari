import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

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

  // Detect reaching shelter
  useEffect(() => {
    if (distance >= 100 && reachedRef.current) {
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
          Distance: <span className="text-neon-green font-bold tabular-nums">{Math.round(progressPct)}m</span> / 100m
        </div>
        <div className="text-xs text-text-muted">
          Siren: <span className="text-alert-red font-bold tabular-nums">{countdown}s</span>
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
      <div className={`flex-1 relative overflow-hidden bg-noir-bg ${hit ? 'bg-alert-red/10' : ''} transition-colors duration-200`}>
        {/* Ground line */}
        <div className="absolute bottom-16 left-0 right-0 h-px bg-noir-border" />

        {/* Hallway lines for depth */}
        <div className="absolute bottom-16 left-0 right-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-px h-2 bg-noir-border/30"
              style={{ left: `${((i * 8 - (distance * 3) % 160 + 160) % 160)}%` }}
            />
          ))}
        </div>

        {/* Player */}
        <motion.div
          className="absolute bottom-16"
          style={{ left: `${PLAYER_X}%` }}
          animate={{ y: jumping ? -40 : 0 }}
          transition={{ duration: JUMP_DURATION / 1000, ease: 'easeOut' }}
        >
          <PlayerSvg jumping={jumping} />
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
          <div
            className="absolute bottom-16 flex flex-col items-center"
            style={{ left: `${PLAYER_X + (100 - distance)}%` }}
          >
            <div className="text-[10px] text-neon-green font-bold mb-1">SHELTER</div>
            <div className="w-10 h-12 border-2 border-neon-green rounded-sm bg-neon-green/10" />
          </div>
        )}

        {/* Tap instruction */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-[10px] text-text-muted/50 uppercase tracking-widest">
            Tap / Space to jump
          </span>
        </div>
      </div>
    </div>
  )
}
