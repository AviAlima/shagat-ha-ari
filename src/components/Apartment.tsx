import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Laptop, Coffee, FlaskConical, Smartphone, ShoppingBag } from 'lucide-react'
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
    <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
      <rect width="300" height="80" fill="#06060a" />
      {/* Buildings */}
      <rect x="10" y="30" width="15" height="50" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="30" y="20" width="12" height="60" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="48" y="35" width="20" height="45" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="75" y="15" width="10" height="65" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="90" y="25" width="18" height="55" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="115" y="10" width="8" height="70" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="128" y="28" width="22" height="52" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="158" y="18" width="14" height="62" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="178" y="32" width="16" height="48" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="200" y="22" width="12" height="58" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="218" y="38" width="20" height="42" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="245" y="12" width="10" height="68" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="260" y="28" width="18" height="52" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      <rect x="284" y="20" width="14" height="60" fill="#0e0e16" stroke="#1a1a2e" strokeWidth="0.5" />
      {/* Scattered lit windows */}
      <rect x="33" y="30" width="3" height="2" fill="#ffab0040" />
      <rect x="53" y="45" width="3" height="2" fill="#448aff30" />
      <rect x="93" y="35" width="3" height="2" fill="#ffab0030" />
      <rect x="133" y="40" width="3" height="2" fill="#ffab0040" />
      <rect x="163" y="28" width="3" height="2" fill="#448aff30" />
      <rect x="205" y="32" width="3" height="2" fill="#ffab0030" />
      <rect x="265" y="38" width="3" height="2" fill="#448aff30" />
    </svg>
  )
}

function ApartmentItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  cooldownPct,
  statusText,
}: {
  icon: typeof Monitor
  label: string
  onClick: () => void
  disabled: boolean
  cooldownPct: number
  statusText: string | null
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer ${
        disabled
          ? 'border-noir-border/50 bg-noir-card/30 opacity-50 cursor-not-allowed'
          : 'border-noir-border bg-noir-card/60 hover:border-alert-red/50 hover:shadow-[0_0_15px_rgba(255,23,68,0.15)]'
      }`}
    >
      <Icon size={28} className={disabled ? 'text-text-muted/50' : 'text-alert-red'} />
      <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      {cooldownPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-noir-border rounded-b-lg overflow-hidden">
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
            className="absolute -top-6 text-[10px] text-neon-green whitespace-nowrap"
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

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* Window / Skyline */}
      <div className="relative h-24 border-b border-noir-border overflow-hidden">
        <TelAvivSkyline />
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-alert-red/20"
            />
          )}
        </AnimatePresence>
        <div className="absolute bottom-2 left-3 text-[10px] text-text-muted/40 uppercase tracking-widest">
          Tel Aviv — View from Window
        </div>
      </div>

      {/* Apartment Room */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* TV headline display */}
        <AnimatePresence>
          {tvText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2 bg-noir-card border border-alert-red/30 rounded text-xs text-alert-red/80 overflow-hidden"
            >
              {tvText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Items Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 flex-1 content-start">
          <ApartmentItem
            icon={Monitor}
            label="TV"
            onClick={handleTV}
            disabled={tvCooldown > 0 || sanity <= 0}
            cooldownPct={(tvCooldown / tvMaxCooldown) * 100}
            statusText={tvText ? null : null}
          />
          <ApartmentItem
            icon={Laptop}
            label="Laptop"
            onClick={handleWork}
            disabled={workCooldown > 0}
            cooldownPct={(workCooldown / workMaxCooldown) * 100}
            statusText={workText}
          />
          <ApartmentItem
            icon={Coffee}
            label="Coffee"
            onClick={handleCoffee}
            disabled={coffeeCooldown > 0}
            cooldownPct={(coffeeCooldown / coffeeMaxCooldown) * 100}
            statusText={coffeeText}
          />
          <ApartmentItem
            icon={FlaskConical}
            label="Ferment"
            onClick={handleFerment}
            disabled={fermentCooldown > 0}
            cooldownPct={(fermentCooldown / fermentMaxCooldown) * 100}
            statusText={fermentText}
          />
          <ApartmentItem
            icon={Smartphone}
            label="Phone"
            onClick={handlePhone}
            disabled={false}
            cooldownPct={0}
            statusText={phoneText}
          />
          <ApartmentItem
            icon={ShoppingBag}
            label="Shop"
            onClick={() => setShopOpen(true)}
            disabled={false}
            cooldownPct={0}
            statusText={null}
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
