import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Laptop, Coffee, FlaskConical, Smartphone, ShoppingBag, Clock } from 'lucide-react'
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

type ItemColorScheme = 'positive' | 'negative' | 'neutral' | 'info'

const colorSchemes: Record<ItemColorScheme, { icon: string; border: string; hover: string; glow: string }> = {
  positive: {
    icon: 'text-neon-green',
    border: 'border-neon-green/20',
    hover: 'hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)]',
    glow: 'bg-neon-green/5',
  },
  negative: {
    icon: 'text-alert-red',
    border: 'border-alert-red/20',
    hover: 'hover:border-alert-red/50 hover:shadow-[0_0_20px_rgba(255,23,68,0.15)]',
    glow: 'bg-alert-red/5',
  },
  neutral: {
    icon: 'text-neon-amber',
    border: 'border-neon-amber/20',
    hover: 'hover:border-neon-amber/50 hover:shadow-[0_0_20px_rgba(255,171,0,0.15)]',
    glow: 'bg-neon-amber/5',
  },
  info: {
    icon: 'text-neon-blue',
    border: 'border-neon-blue/20',
    hover: 'hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(68,138,255,0.15)]',
    glow: 'bg-neon-blue/5',
  },
}

function ApartmentItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  cooldownPct,
  statusText,
  colorScheme = 'negative',
  subtitle,
}: {
  icon: typeof Monitor
  label: string
  onClick: () => void
  disabled: boolean
  cooldownPct: number
  statusText: string | null
  colorScheme?: ItemColorScheme
  subtitle?: string
}) {
  const scheme = colorSchemes[colorScheme]
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.06, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center gap-2.5 p-5 rounded-xl border transition-all cursor-pointer ${
        disabled
          ? 'border-noir-border/30 bg-noir-card/20 opacity-40 cursor-not-allowed'
          : `${scheme.border} bg-noir-card/50 ${scheme.hover} ${scheme.glow}`
      }`}
    >
      <div className={`p-2.5 rounded-lg ${disabled ? 'bg-noir-card/30' : `${scheme.glow} border border-current/10`}`}>
        <Icon size={32} className={disabled ? 'text-text-muted/30' : scheme.icon} />
      </div>
      <span className="text-xs text-text-muted uppercase tracking-wider font-bold">{label}</span>
      {subtitle && (
        <span className="text-[9px] text-text-muted/50">{subtitle}</span>
      )}
      {cooldownPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-noir-border rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-alert-red/60 transition-all duration-300"
            style={{ width: `${cooldownPct}%` }}
          />
        </div>
      )}
      <AnimatePresence>
        {statusText && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -top-7 text-[11px] text-neon-green whitespace-nowrap font-bold stat-glow"
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
  const coffeeMaxCooldown = 30000
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
    const boost = upgrades.premiumCoffee ? 30 : 15
    onSanityChange(prev => prev + boost)
    onAdvanceTime()
    setCoffeeCooldown(coffeeMaxCooldown)
    showStatus(setCoffeeText, `+${boost} Sanity`)
  }, [coffeeCooldown, upgrades.premiumCoffee, onSanityChange, onAdvanceTime, showStatus])

  const handleFerment = useCallback(() => {
    if (fermentCooldown > 0) return
    onSanityChange(prev => prev + 10)
    onAdvanceTime()
    setFermentCooldown(fermentMaxCooldown)
    showStatus(setFermentText, '+10 Sanity')
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

        {/* Interactive Items Grid — larger icons, better spacing, color-coded */}
        <div className="grid grid-cols-3 gap-3 flex-1 content-start">
          <ApartmentItem
            icon={Monitor}
            label="TV"
            subtitle="-2 Sanity"
            onClick={handleTV}
            disabled={tvCooldown > 0 || sanity <= 0}
            cooldownPct={(tvCooldown / tvMaxCooldown) * 100}
            statusText={tvText}
            colorScheme="negative"
          />
          <ApartmentItem
            icon={Laptop}
            label="Work"
            subtitle="+Cash"
            onClick={handleWork}
            disabled={workCooldown > 0}
            cooldownPct={(workCooldown / workMaxCooldown) * 100}
            statusText={workText}
            colorScheme="neutral"
          />
          <ApartmentItem
            icon={Coffee}
            label="Coffee"
            subtitle={`+${upgrades.premiumCoffee ? 30 : 15} Sanity`}
            onClick={handleCoffee}
            disabled={coffeeCooldown > 0}
            cooldownPct={(coffeeCooldown / coffeeMaxCooldown) * 100}
            statusText={coffeeText}
            colorScheme="positive"
          />
          <ApartmentItem
            icon={FlaskConical}
            label="Ferment"
            subtitle="+10 Sanity"
            onClick={handleFerment}
            disabled={fermentCooldown > 0}
            cooldownPct={(fermentCooldown / fermentMaxCooldown) * 100}
            statusText={fermentText}
            colorScheme="positive"
          />
          <ApartmentItem
            icon={Smartphone}
            label="Phone"
            subtitle="Check Status"
            onClick={handlePhone}
            disabled={false}
            cooldownPct={0}
            statusText={phoneText}
            colorScheme="info"
          />
          <ApartmentItem
            icon={ShoppingBag}
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
