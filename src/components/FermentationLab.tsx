import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FermentationLabProps {
  onComplete: (success: boolean) => void
}

const GAME_DURATION = 30
const GREEN_MIN = 40
const GREEN_MAX = 70
const GREEN_TIME_NEEDED = 20
const TICK_INTERVAL = 500
const DISRUPTION_MIN_INTERVAL = 8000
const DISRUPTION_MAX_INTERVAL = 12000

type Disruption = 'power' | 'salt' | null

interface Bubble {
  id: number
  x: number
  delay: number
  size: number
}

function MasonJarSvg({ activity, glowColor }: { activity: number; glowColor: string }) {
  const fillHeight = 20 + (activity / 100) * 50
  const fillY = 85 - fillHeight

  const fillColor =
    glowColor === 'green'
      ? '#00e676'
      : glowColor === 'amber'
        ? '#ffab00'
        : '#ff1744'
  const fillOpacity = 0.3

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      {/* Jar body */}
      <rect x="20" y="20" width="60" height="65" rx="6" stroke="#555" strokeWidth="2" fill="#12121a" />
      {/* Jar neck */}
      <rect x="30" y="10" width="40" height="12" rx="2" stroke="#555" strokeWidth="2" fill="#12121a" />
      {/* Lid */}
      <rect x="28" y="6" width="44" height="6" rx="2" fill="#333" stroke="#555" strokeWidth="1.5" />
      {/* Liquid fill */}
      <rect
        x="22"
        y={fillY}
        width="56"
        height={fillHeight}
        rx="4"
        fill={fillColor}
        opacity={fillOpacity}
      />
      {/* Glow overlay */}
      <rect
        x="20"
        y="20"
        width="60"
        height="65"
        rx="6"
        fill="none"
        stroke={fillColor}
        strokeWidth="1.5"
        opacity={0.5}
      />
    </svg>
  )
}

function BubblesOverlay({ activity }: { activity: number }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(activity / 25) + 1
      const newBubbles: Bubble[] = []
      for (let i = 0; i < count; i++) {
        newBubbles.push({
          id: nextId.current++,
          x: 25 + Math.random() * 50,
          delay: Math.random() * 0.3,
          size: 3 + Math.random() * 4,
        })
      }
      setBubbles(prev => [...prev.slice(-20), ...newBubbles])
    }, 600)
    return () => clearInterval(interval)
  }, [activity])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0.7, y: '80%', x: `${b.x}%` }}
            animate={{ opacity: 0, y: '15%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 + Math.random(), delay: b.delay, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setBubbles(prev => prev.filter(bb => bb.id !== b.id))
            }}
            className="absolute rounded-full bg-neon-green/40"
            style={{ width: b.size, height: b.size }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ActivityGauge({ activity }: { activity: number }) {
  return (
    <div className="w-full">
      <div className="relative h-4 bg-noir-card rounded-full overflow-hidden border border-noir-border">
        {/* Green zone highlight */}
        <div
          className="absolute top-0 bottom-0 bg-neon-green/20 border-x border-neon-green/40"
          style={{ left: `${GREEN_MIN}%`, width: `${GREEN_MAX - GREEN_MIN}%` }}
        />
        {/* Activity marker */}
        <motion.div
          className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          animate={{ left: `${Math.max(0, Math.min(100, activity)) - 0.75}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[8px] text-text-muted">0</span>
        <span className="text-[8px] text-neon-green">GREEN ZONE</span>
        <span className="text-[8px] text-text-muted">100</span>
      </div>
    </div>
  )
}

const sliderStyles = `
  .ferment-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    outline: none;
    width: 100%;
  }
  .ferment-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
  }
  .ferment-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  .ferment-slider.salt-slider {
    background: #2a2a3e;
  }
  .ferment-slider.salt-slider::-webkit-slider-thumb {
    background: #448aff;
    box-shadow: 0 0 8px rgba(68,138,255,0.5);
  }
  .ferment-slider.salt-slider::-moz-range-thumb {
    background: #448aff;
    box-shadow: 0 0 8px rgba(68,138,255,0.5);
  }
  .ferment-slider.temp-slider {
    background: #2a2a3e;
  }
  .ferment-slider.temp-slider::-webkit-slider-thumb {
    background: #ffab00;
    box-shadow: 0 0 8px rgba(255,171,0,0.5);
  }
  .ferment-slider.temp-slider::-moz-range-thumb {
    background: #ffab00;
    box-shadow: 0 0 8px rgba(255,171,0,0.5);
  }
`

export function FermentationLab({ onComplete }: FermentationLabProps) {
  const [salt, setSalt] = useState(50)
  const [temp, setTemp] = useState(50)
  const [activity, setActivity] = useState(55)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [greenTime, setGreenTime] = useState(0)
  const [disruption, setDisruption] = useState<Disruption>(null)
  const [gameOver, setGameOver] = useState(false)
  const [success, setSuccess] = useState(false)
  const [shaking, setShaking] = useState(false)

  const activityRef = useRef(activity)
  activityRef.current = activity
  const saltRef = useRef(salt)
  saltRef.current = salt
  const tempRef = useRef(temp)
  tempRef.current = temp
  const greenTimeRef = useRef(greenTime)
  greenTimeRef.current = greenTime
  const gameOverRef = useRef(gameOver)
  gameOverRef.current = gameOver

  // Activity update tick
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      if (gameOverRef.current) return
      setActivity(prev => {
        const s = saltRef.current
        const t = tempRef.current
        let delta = 0

        const saltInIdeal = s >= 35 && s <= 65
        const tempInIdeal = t >= 40 && t <= 60

        if (saltInIdeal && tempInIdeal) {
          delta = (55 - prev) * 0.3
        } else {
          if (s > 70) delta += -((s - 70) / 30) * 8
          if (s < 20) delta += ((20 - s) / 20) * 6
          if (t > 70) delta += (Math.random() - 0.3) * 12
          if (t < 30) delta += -((30 - t) / 30) * 4

          if (!saltInIdeal && s >= 20 && s <= 70) {
            delta += (55 - prev) * 0.1
          }
          if (!tempInIdeal && t >= 30 && t <= 70) {
            delta += (55 - prev) * 0.1
          }
        }

        const noise = (Math.random() - 0.5) * 4
        const next = prev + delta + noise
        return Math.max(0, Math.min(100, next))
      })
    }, TICK_INTERVAL)
    return () => clearInterval(timer)
  }, [gameOver])

  // Green time tracker (runs every 500ms to match tick)
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      if (gameOverRef.current) return
      const a = activityRef.current
      if (a >= GREEN_MIN && a <= GREEN_MAX) {
        setGreenTime(prev => prev + 0.5)
      }
    }, TICK_INTERVAL)
    return () => clearInterval(timer)
  }, [gameOver])

  // Countdown timer
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      if (gameOverRef.current) return
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true)
          const isSuccess = greenTimeRef.current >= GREEN_TIME_NEEDED
          setSuccess(isSuccess)
          setTimeout(() => onComplete(isSuccess), 2000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameOver, onComplete])

  // Random disruptions
  useEffect(() => {
    if (gameOver) return
    let timeout: ReturnType<typeof setTimeout>
    const scheduleDisruption = () => {
      const delay = DISRUPTION_MIN_INTERVAL + Math.random() * (DISRUPTION_MAX_INTERVAL - DISRUPTION_MIN_INTERVAL)
      timeout = setTimeout(() => {
        if (gameOverRef.current) return
        const isPower = Math.random() > 0.5
        if (isPower) {
          setDisruption('power')
          setTemp(prev => Math.max(0, Math.min(100, prev + (Math.random() > 0.5 ? 15 : -15))))
        } else {
          setDisruption('salt')
          setSalt(prev => Math.max(0, Math.min(100, prev + (Math.random() > 0.5 ? 10 : -10))))
        }
        setShaking(true)
        setTimeout(() => setShaking(false), 500)
        setTimeout(() => setDisruption(null), 1500)
        scheduleDisruption()
      }, delay)
    }
    scheduleDisruption()
    return () => clearTimeout(timeout)
  }, [gameOver])

  const glowColor =
    activity >= GREEN_MIN && activity <= GREEN_MAX
      ? 'green'
      : (activity >= 30 && activity < GREEN_MIN) || (activity > GREEN_MAX && activity <= 80)
        ? 'amber'
        : 'red'

  const handleSaltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalt(Number(e.target.value))
  }, [])

  const handleTempChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTemp(Number(e.target.value))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
    >
      <style>{sliderStyles}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-noir-bg/85 backdrop-blur-sm" />

      {/* Main card */}
      <motion.div
        animate={shaking ? { x: [0, -4, 4, -3, 3, 0], y: [0, 2, -2, 1, -1, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm bg-noir-card border border-noir-border rounded-lg p-5 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
      >
        {/* Game Over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg ${
                success ? 'bg-neon-green/10' : 'bg-alert-red/10'
              }`}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="text-center"
              >
                {success ? (
                  <>
                    <p className="text-2xl font-bold text-neon-green mb-2">Perfect Fermentation!</p>
                    <p className="text-3xl">{'\u{1F952}'}</p>
                    <p className="text-xs text-neon-green/70 mt-2">+15 Sanity, +8 Supplies</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-alert-red mb-2">Jar Exploded!</p>
                    <p className="text-3xl">{'\u{1F4A5}'}</p>
                    <p className="text-xs text-text-muted mt-2">The family can't stop laughing</p>
                    <p className="text-xs text-alert-red/70 mt-1">-8 Sanity, +5 Morale</p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-sm font-bold text-neon-green uppercase tracking-wider">
            {'\u{1F9EA}'} Fermentation Lab
          </h2>
          <span className="text-sm font-mono text-neon-amber">{timeLeft}s</span>
        </div>

        {/* Green time tracker */}
        <div className="w-full text-center">
          <span className={`text-[11px] font-mono ${greenTime >= GREEN_TIME_NEEDED ? 'text-neon-green' : 'text-text-muted'}`}>
            In zone: {greenTime.toFixed(1)}s / {GREEN_TIME_NEEDED}s needed
          </span>
        </div>

        {/* Disruption banner */}
        <AnimatePresence>
          {disruption && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-12 z-20 px-4 py-1.5 rounded bg-alert-red/90 text-white text-xs font-bold uppercase tracking-wider"
            >
              {disruption === 'power' ? 'POWER SURGE!' : 'SALT CLUMP!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jar area */}
        <div className="relative w-32 h-32">
          <MasonJarSvg activity={activity} glowColor={glowColor} />
          <BubblesOverlay activity={activity} />
        </div>

        {/* Activity Gauge */}
        <div className="w-full">
          <span className="text-[9px] text-text-muted uppercase tracking-wider">Biological Activity</span>
          <ActivityGauge activity={activity} />
        </div>

        {/* Salt slider */}
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-neon-blue uppercase tracking-wider">Salt Level</span>
            <span className="text-[9px] text-neon-blue font-mono">{salt}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={salt}
            onChange={handleSaltChange}
            className="ferment-slider salt-slider"
            disabled={gameOver}
          />
        </div>

        {/* Temperature slider */}
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-neon-amber uppercase tracking-wider">Temperature</span>
            <span className="text-[9px] text-neon-amber font-mono">{temp}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={temp}
            onChange={handleTempChange}
            className="ferment-slider temp-slider"
            disabled={gameOver}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
