import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Shop } from './Shop'
import type { Upgrades } from '../hooks/useGameState'

interface ApartmentProps {
  sanity: number
  battery: number
  cash: number
  upgrades: Upgrades
  onSanityChange: (fn: (prev: number) => number) => void
  onCashChange: (fn: (prev: number) => number) => void
  onUpgrade: (key: keyof Upgrades) => void
  onAdvanceTime: () => void
}

const headlines = [
  'IDF confirms operation in southern Lebanon...',
  'GPS jamming across central Israel continues...',
  'Fuel rationing enters third week...',
  'Iron Dome intercepts over Haifa Bay...',
  'Rolling blackouts expected tonight 22:00-06:00...',
  'Residents urged to stay near sheltered spaces...',
  'Cellular networks heavily congested...',
  'Emergency generators running at Ichilov...',
]

function TelAvivSkyline() {
  return (
    <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06060a" />
          <stop offset="60%" stopColor="#0a0a14" />
          <stop offset="100%" stopColor="#0e0e1a" />
        </linearGradient>
        {/* Window glow */}
        <filter id="windowGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="300" height="100" fill="url(#skyGrad)" />
      {/* Stars */}
      <circle cx="45" cy="12" r="0.5" fill="#e0e0e0" opacity="0.3" />
      <circle cx="120" cy="8" r="0.4" fill="#e0e0e0" opacity="0.4" />
      <circle cx="200" cy="15" r="0.5" fill="#e0e0e0" opacity="0.25" />
      <circle cx="260" cy="10" r="0.6" fill="#e0e0e0" opacity="0.35" />
      {/* Buildings */}
      <rect x="10" y="40" width="15" height="60" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="30" y="28" width="12" height="72" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="48" y="45" width="20" height="55" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="75" y="20" width="10" height="80" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="90" y="32" width="18" height="68" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="115" y="14" width="8" height="86" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="128" y="36" width="22" height="64" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="158" y="24" width="14" height="76" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="178" y="42" width="16" height="58" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="200" y="30" width="12" height="70" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="218" y="48" width="20" height="52" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="245" y="16" width="10" height="84" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="260" y="35" width="18" height="65" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="284" y="26" width="14" height="74" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      {/* More scattered lit windows with glow */}
      <g filter="url(#windowGlow)">
        <rect x="33" y="38" width="3" height="2" fill="#ffab0050" />
        <rect x="33" y="50" width="3" height="2" fill="#ffab0030" />
        <rect x="53" y="55" width="3" height="2" fill="#448aff40" />
        <rect x="55" y="65" width="3" height="2" fill="#ffab0040" />
        <rect x="93" y="42" width="3" height="2" fill="#ffab0040" />
        <rect x="95" y="55" width="3" height="2" fill="#448aff30" />
        <rect x="93" y="68" width="3" height="2" fill="#ffab0030" />
        <rect x="133" y="48" width="3" height="2" fill="#ffab0050" />
        <rect x="140" y="60" width="3" height="2" fill="#448aff30" />
        <rect x="163" y="34" width="3" height="2" fill="#448aff40" />
        <rect x="163" y="50" width="3" height="2" fill="#ffab0035" />
        <rect x="183" y="52" width="3" height="2" fill="#ffab0040" />
        <rect x="205" y="40" width="3" height="2" fill="#ffab0040" />
        <rect x="205" y="56" width="3" height="2" fill="#448aff30" />
        <rect x="225" y="58" width="3" height="2" fill="#ffab0030" />
        <rect x="265" y="45" width="3" height="2" fill="#448aff40" />
        <rect x="267" y="60" width="3" height="2" fill="#ffab0035" />
        <rect x="288" y="38" width="3" height="2" fill="#ffab0040" />
      </g>
    </svg>
  )
}

// --- Custom SVG Illustrations ---

function TVSvg() {
  return (
    <svg viewBox="0 0 80 70" width="80" height="70" fill="none">
      {/* Antenna */}
      <line x1="30" y1="10" x2="40" y2="0" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="10" x2="40" y2="0" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      {/* Outer casing */}
      <rect x="10" y="10" width="60" height="48" rx="5" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Screen */}
      <motion.rect
        x="16" y="16" width="48" height="36" rx="2"
        fill="#111822"
        stroke="#333"
        strokeWidth="0.5"
        animate={{ opacity: [0.6, 0.9, 0.7, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Scan lines on screen */}
      {[20, 25, 30, 35, 40, 45].map(y => (
        <line key={y} x1="18" y1={y} x2="62" y2={y} stroke="#334455" strokeWidth="0.3" opacity="0.4" />
      ))}
      {/* Feet */}
      <rect x="18" y="58" width="8" height="4" rx="1" fill="#1a1a2e" />
      <rect x="54" y="58" width="8" height="4" rx="1" fill="#1a1a2e" />
    </svg>
  )
}

function LaptopSvg() {
  return (
    <svg viewBox="0 0 80 64" width="80" height="64" fill="none">
      {/* Screen (angled) */}
      <rect x="16" y="4" width="48" height="32" rx="2" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Screen inner */}
      <rect x="20" y="8" width="40" height="24" rx="1" fill="#0e1420" />
      {/* Code lines on screen */}
      {[12, 16, 20, 24, 28].map((y, i) => (
        <line key={y} x1="24" y1={y} x2={44 + (i % 3) * 6} y2={y} stroke="#448aff" strokeWidth="0.6" opacity="0.3" />
      ))}
      {/* Hinge */}
      <line x1="14" y1="37" x2="66" y2="37" stroke="#2a2a3e" strokeWidth="1" />
      {/* Keyboard base */}
      <rect x="10" y="37" width="60" height="16" rx="2" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Keys */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect key={`r1-${i}`} x={18 + i * 7} y={41} width="5" height="3" rx="0.5" fill="#222236" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect key={`r2-${i}`} x={18 + i * 7} y={46} width="5" height="3" rx="0.5" fill="#222236" />
      ))}
      {/* Trackpad */}
      <rect x="32" y="51" width="16" height="1.5" rx="0.5" fill="#222236" />
    </svg>
  )
}

function CoffeeSvg() {
  return (
    <svg viewBox="0 0 60 80" width="60" height="80" fill="none">
      {/* Steam */}
      {[0, 1, 2].map(i => (
        <motion.path
          key={i}
          d={`M${26 + i * 5},28 Q${28 + i * 5},22 ${26 + i * 5},16 Q${24 + i * 5},10 ${26 + i * 5},4`}
          stroke="#aaa"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          animate={{ y: [-2, -12], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}
      {/* Lid */}
      <rect x="18" y="30" width="24" height="6" rx="2" fill="#2a2a3e" stroke="#3a3a4e" strokeWidth="1" />
      {/* Lid top nub */}
      <rect x="27" y="27" width="6" height="4" rx="1.5" fill="#2a2a3e" />
      {/* Body */}
      <rect x="16" y="36" width="28" height="38" rx="3" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Handle */}
      <path d="M44,46 Q54,46 54,56 Q54,66 44,66" stroke="#2a2a3e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Band */}
      <rect x="16" y="50" width="28" height="6" fill="#222236" opacity="0.6" />
    </svg>
  )
}

function FermentSvg() {
  return (
    <svg viewBox="0 0 60 80" width="60" height="80" fill="none">
      {/* Jar body */}
      <rect x="12" y="18" width="36" height="52" rx="3" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Neck */}
      <rect x="18" y="10" width="24" height="10" rx="2" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Lid */}
      <rect x="16" y="6" width="28" height="6" rx="2" fill="#2a2a3e" stroke="#3a3a4e" strokeWidth="1" />
      {/* Liquid fill at ~70% */}
      <rect x="14" y="34" width="32" height="34" rx="2" fill="#448aff" opacity="0.15" />
      {/* Bubbles */}
      {[0, 1, 2].map(i => (
        <motion.circle
          key={i}
          cx={24 + i * 7}
          r={1.5 + (i % 2) * 0.5}
          fill="#448aff"
          animate={{ cy: [60, 36], opacity: [0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}
    </svg>
  )
}

function PhoneSvg() {
  return (
    <svg viewBox="0 0 44 72" width="44" height="72" fill="none">
      {/* Phone body */}
      <rect x="6" y="4" width="32" height="64" rx="6" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="10" y="10" width="24" height="48" rx="2" fill="#0e1420" />
      {/* Signal bars */}
      <rect x="13" y="16" width="2" height="4" fill="#448aff" opacity="0.4" />
      <rect x="17" y="14" width="2" height="6" fill="#448aff" opacity="0.5" />
      <rect x="21" y="12" width="2" height="8" fill="#448aff" opacity="0.6" />
      <rect x="25" y="10" width="2" height="10" fill="#448aff" opacity="0.7" />
      {/* Home button */}
      <circle cx="22" cy="62" r="3" stroke="#2a2a3e" strokeWidth="1" fill="none" />
    </svg>
  )
}

function ShopBagSvg() {
  return (
    <svg viewBox="0 0 60 70" width="60" height="70" fill="none">
      {/* Handles */}
      <path d="M20,22 Q20,8 30,8 Q40,8 40,22" stroke="#2a2a3e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Bag body (trapezoid) */}
      <path d="M10,22 L14,64 L46,64 L50,22 Z" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Fold line */}
      <line x1="12" y1="28" x2="48" y2="28" stroke="#2a2a3e" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

// SVG component map
const svgComponents: Record<string, () => JSX.Element> = {
  tv: TVSvg,
  laptop: LaptopSvg,
  coffee: CoffeeSvg,
  ferment: FermentSvg,
  phone: PhoneSvg,
  shop: ShopBagSvg,
}

type ItemColorScheme = 'positive' | 'negative' | 'neutral' | 'info'

const colorSchemes: Record<ItemColorScheme, { border: string; hover: string; glow: string }> = {
  positive: {
    border: 'border-neon-green/20',
    hover: 'hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)]',
    glow: 'bg-neon-green/5',
  },
  negative: {
    border: 'border-alert-red/20',
    hover: 'hover:border-alert-red/50 hover:shadow-[0_0_20px_rgba(255,23,68,0.15)]',
    glow: 'bg-alert-red/5',
  },
  neutral: {
    border: 'border-neon-amber/20',
    hover: 'hover:border-neon-amber/50 hover:shadow-[0_0_20px_rgba(255,171,0,0.15)]',
    glow: 'bg-neon-amber/5',
  },
  info: {
    border: 'border-neon-blue/20',
    hover: 'hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(68,138,255,0.15)]',
    glow: 'bg-neon-blue/5',
  },
}

const glowColors: Record<string, string> = {
  tv: '#ff4444',
  laptop: '#ffab00',
  coffee: '#00e676',
  ferment: '#448aff',
  phone: '#448aff',
  shop: '#ffab00',
}

function ApartmentItem({
  svgKey,
  label,
  onClick,
  disabled,
  cooldownPct,
  statusText,
  colorScheme = 'negative',
  subtitle,
}: {
  svgKey: string
  label: string
  onClick: () => void
  disabled: boolean
  cooldownPct: number
  statusText: string | null
  colorScheme?: ItemColorScheme
  subtitle?: string
}) {
  const scheme = colorSchemes[colorScheme]
  const SvgComponent = svgComponents[svgKey]
  const glowColor = glowColors[svgKey]

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer ${
        disabled
          ? 'border-noir-border/30 bg-noir-card/20 opacity-40 cursor-not-allowed'
          : `${scheme.border} bg-noir-card/40 ${scheme.hover}`
      }`}
    >
      {/* SVG with neon backlight */}
      <div className="relative flex items-center justify-center w-full" style={{ height: '68px' }}>
        {/* Glow layer */}
        {!disabled && (
          <div
            className="absolute blur-xl opacity-30 rounded-full"
            style={{
              backgroundColor: glowColor,
              width: '60px',
              height: '60px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        {/* SVG on top */}
        <div className="relative z-10 flex items-center justify-center" style={{ height: '64px' }}>
          <SvgComponent />
        </div>
      </div>

      {/* Label and subtitle */}
      <div className="flex flex-col items-center text-center min-w-0">
        <span className="text-[11px] text-text-primary/80 uppercase tracking-wider font-bold">{label}</span>
        {subtitle && (
          <span className={`text-[9px] ${disabled ? 'text-text-muted/30' : 'text-text-muted/60'}`}>{subtitle}</span>
        )}
      </div>

      {/* Cooldown bar */}
      {cooldownPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-noir-border rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-alert-red/60 transition-all duration-300"
            style={{ width: `${cooldownPct}%` }}
          />
        </div>
      )}

      {/* Status text popup */}
      <AnimatePresence>
        {statusText && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -top-5 left-2 text-[10px] text-neon-green whitespace-nowrap font-bold stat-glow"
          >
            {statusText}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function Apartment({
  sanity,
  battery,
  cash,
  upgrades,
  onSanityChange,
  onCashChange,
  onUpgrade,
  onAdvanceTime,
}: ApartmentProps) {
  const [shopOpen, setShopOpen] = useState(false)
  const [tvText, setTvText] = useState<string | null>(null)
  const [workText, setWorkText] = useState<string | null>(null)
  const [coffeeText, setCoffeeText] = useState<string | null>(null)
  const [fermentText, setFermentText] = useState<string | null>(null)
  const [phoneText, setPhoneText] = useState<string | null>(null)

  // Cooldowns in ms
  const [tvCooldown, setTvCooldown] = useState(0)
  const [workCooldown, setWorkCooldown] = useState(0)
  const [coffeeCooldown, setCoffeeCooldown] = useState(0)
  const [fermentCooldown, setFermentCooldown] = useState(0)

  const tvMaxCooldown = 2000
  const workMaxCooldown = 3000
  const coffeeMaxCooldown = 45000
  const fermentMaxCooldown = 45000

  // Distant flash effect
  const [flash, setFlash] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const scheduleFlash = () => {
      flashTimer.current = setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
        scheduleFlash()
      }, 5000 + Math.random() * 15000)
    }
    scheduleFlash()
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current) }
  }, [])

  // Cooldown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTvCooldown(prev => Math.max(0, prev - 100))
      setWorkCooldown(prev => Math.max(0, prev - 100))
      setCoffeeCooldown(prev => Math.max(0, prev - 100))
      setFermentCooldown(prev => Math.max(0, prev - 100))
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const showStatus = useCallback((setter: (v: string | null) => void, text: string) => {
    setter(text)
    setTimeout(() => setter(null), 1500)
  }, [])

  const handleTV = useCallback(() => {
    if (tvCooldown > 0) return
    onSanityChange(prev => prev - 2)
    onAdvanceTime()
    setTvCooldown(tvMaxCooldown)
    const headline = headlines[Math.floor(Math.random() * headlines.length)]
    showStatus(setTvText, headline)
  }, [tvCooldown, onSanityChange, onAdvanceTime, showStatus])

  const handleWork = useCallback(() => {
    if (workCooldown > 0) return
    const earned = 5 + Math.floor(Math.random() * 11)
    onCashChange(prev => prev + earned)
    onAdvanceTime()
    setWorkCooldown(workMaxCooldown)
    showStatus(setWorkText, `+₪${earned}`)
  }, [workCooldown, onCashChange, onAdvanceTime, showStatus])

  const handleCoffee = useCallback(() => {
    if (coffeeCooldown > 0) return
    const boost = upgrades.premiumCoffee ? 18 : 8
    onSanityChange(prev => prev + boost)
    onAdvanceTime()
    setCoffeeCooldown(coffeeMaxCooldown)
    showStatus(setCoffeeText, `+${boost} Sanity`)
  }, [coffeeCooldown, upgrades.premiumCoffee, onSanityChange, onAdvanceTime, showStatus])

  const handleFerment = useCallback(() => {
    if (fermentCooldown > 0) return
    onSanityChange(prev => prev + 5)
    onAdvanceTime()
    setFermentCooldown(fermentMaxCooldown)
    showStatus(setFermentText, '+5 Sanity')
  }, [fermentCooldown, onSanityChange, onAdvanceTime, showStatus])

  const handlePhone = useCallback(() => {
    const earlyAlert = battery > 0 ? 'ON' : 'OFF'
    const countdown = battery > 0 ? '60s' : '15s'
    showStatus(setPhoneText, `Battery ${battery}% | Early Alert: ${earlyAlert} (${countdown})`)
  }, [battery, showStatus])

  // Idle state — shows pulsing text when no cooldowns are active
  const isIdle = tvCooldown === 0 && workCooldown === 0 && coffeeCooldown === 0 && fermentCooldown === 0

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* Window / Skyline — taller, more atmospheric */}
      <div className="relative h-36 border-b border-noir-border/60 overflow-hidden">
        <TelAvivSkyline />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-bg/80 via-transparent to-transparent" />
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-alert-red/25"
            />
          )}
        </AnimatePresence>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <span className="text-[10px] text-text-muted/40 uppercase tracking-widest">
            Tel Aviv — View from Window
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted/30">
            <Clock size={10} />
            <span className="tabular-nums">{new Date().toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Ambient room description */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[11px] text-text-muted/50 italic">
          Your Tel Aviv apartment. Sirens could come any moment.
        </p>
        {isIdle && (
          <motion.p
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[10px] text-text-muted/30 mt-1"
          >
            Waiting...
          </motion.p>
        )}
      </div>

      {/* Apartment Room */}
      <div className="flex-1 px-4 pb-4 pt-2 flex flex-col gap-4">
        {/* TV headline display */}
        <AnimatePresence>
          {tvText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2.5 bg-noir-card border border-alert-red/30 rounded-lg text-xs text-alert-red/80 overflow-hidden shadow-[0_0_20px_rgba(255,23,68,0.1)]"
            >
              {tvText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Items Grid — 3 columns, vertical cards */}
        <div className="grid grid-cols-3 gap-2 flex-1 content-start">
          <ApartmentItem
            svgKey="tv"
            label="TV"
            subtitle="-2 Sanity"
            onClick={handleTV}
            disabled={tvCooldown > 0 || sanity <= 0}
            cooldownPct={(tvCooldown / tvMaxCooldown) * 100}
            statusText={tvText}
            colorScheme="negative"
          />
          <ApartmentItem
            svgKey="laptop"
            label="Work"
            subtitle="+Cash"
            onClick={handleWork}
            disabled={workCooldown > 0}
            cooldownPct={(workCooldown / workMaxCooldown) * 100}
            statusText={workText}
            colorScheme="neutral"
          />
          <ApartmentItem
            svgKey="coffee"
            label="Coffee"
            subtitle={`+${upgrades.premiumCoffee ? 18 : 8} Sanity`}
            onClick={handleCoffee}
            disabled={coffeeCooldown > 0}
            cooldownPct={(coffeeCooldown / coffeeMaxCooldown) * 100}
            statusText={coffeeText}
            colorScheme="positive"
          />
          <ApartmentItem
            svgKey="ferment"
            label="Ferment"
            subtitle="+5 Sanity"
            onClick={handleFerment}
            disabled={fermentCooldown > 0}
            cooldownPct={(fermentCooldown / fermentMaxCooldown) * 100}
            statusText={fermentText}
            colorScheme="positive"
          />
          <ApartmentItem
            svgKey="phone"
            label="Phone"
            subtitle="Check Status"
            onClick={handlePhone}
            disabled={false}
            cooldownPct={0}
            statusText={phoneText}
            colorScheme="info"
          />
          <ApartmentItem
            svgKey="shop"
            label="Shop"
            subtitle={`₪${cash}`}
            onClick={() => setShopOpen(true)}
            disabled={false}
            cooldownPct={0}
            statusText={null}
            colorScheme="neutral"
          />
        </div>
      </div>

      {/* Shop Overlay */}
      <AnimatePresence>
        {shopOpen && (
          <Shop
            cash={cash}
            upgrades={upgrades}
            onBuy={(key, cost) => {
              onCashChange(prev => prev - cost)
              onUpgrade(key)
            }}
            onClose={() => setShopOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
