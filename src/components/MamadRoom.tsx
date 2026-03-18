import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Radio, BatteryCharging, Dices } from 'lucide-react'
import type { Upgrades } from '../hooks/useGameState'

interface MamadRoomProps {
  sanity: number
  battery: number
  cash: number
  upgrades: Upgrades
  familyMorale: number
  supplies: number
  mamadDay: number
  onSanityChange: (fn: (prev: number) => number) => void
  onFamilyMoraleChange: (fn: (prev: number) => number) => void
  onSuppliesChange: (fn: (prev: number) => number) => void
  onBatteryChange: (fn: (prev: number) => number) => void
  onAdvanceDay: () => void
}

// --- NPC dialog lines ---

const momLines = [
  'Did you eat?',
  'Call your sister!',
  'I heard a boom, was that real?',
  'The neighbor said they\'re running out of bread',
  'Drink some water at least',
  'When was the last time you slept?',
  'I made rice, eat something',
  'Your aunt called, she\'s worried',
]

const dadNewsLines = [
  'They hit the port in Haifa',
  'Ceasefire talks starting Thursday',
  'Army called up another battalion',
  'Power grid took a hit in the north',
  'UN Security Council meeting tonight',
  'They intercepted 30 rockets over Gush Dan',
  'Reserves called up for another 30 days',
  'Egypt closed the Rafah crossing again',
]

const radioLines = [
  'Home Front Command: Stay in sheltered spaces',
  'Sirens reported in northern districts',
  'Emergency supply points open 8:00-14:00',
  'Water rationing may begin next week',
  'All clear for central region... for now',
  'Cellular networks under heavy load',
  'Home Front Command: Prepare 72-hour kits',
  'Red alert clusters detected heading south',
]

// --- SVG NPC Components ---

function MomSvg() {
  return (
    <svg viewBox="0 0 32 56" className="w-10 h-16" fill="none">
      {/* Head */}
      <circle cx="16" cy="8" r="6" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
      {/* Hair */}
      <path d="M10 6 Q10 2 16 2 Q22 2 22 6" stroke="#888" strokeWidth="1" fill="none" />
      {/* Body / dress */}
      <line x1="16" y1="14" x2="16" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      <path d="M10 28 L16 28 L22 28 L20 44 L12 44 Z" stroke="#e0e0e0" strokeWidth="1" fill="#1a1a2e" />
      {/* Arms clasped - trembling animated via CSS */}
      <line x1="16" y1="18" x2="10" y2="26" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="16" y1="18" x2="22" y2="26" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Hands clasped together */}
      <circle cx="16" cy="27" r="2" stroke="#e0e0e0" strokeWidth="1" fill="#12121a" />
      {/* Legs */}
      <line x1="13" y1="44" x2="11" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="19" y1="44" x2="21" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

function DadSvg() {
  return (
    <svg viewBox="0 0 40 56" className="w-12 h-16" fill="none">
      {/* Head */}
      <circle cx="20" cy="8" r="6" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
      {/* Body - seated */}
      <line x1="20" y1="14" x2="20" y2="30" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Arms holding phone */}
      <line x1="20" y1="20" x2="12" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="20" y1="20" x2="28" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Phone/TV glow */}
      <rect x="12" y="28" width="16" height="10" rx="1" fill="#06060a" stroke="#448aff" strokeWidth="0.8" />
      <rect x="14" y="30" width="12" height="6" fill="#448aff" opacity="0.15" />
      {/* Screen glow */}
      <rect x="15" y="31" width="4" height="1" fill="#448aff" opacity="0.5" />
      <rect x="21" y="31" width="3" height="1" fill="#ff1744" opacity="0.4" />
      <rect x="15" y="33" width="8" height="1" fill="#448aff" opacity="0.3" />
      {/* Legs - bent, seated */}
      <line x1="20" y1="30" x2="14" y2="42" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="14" y1="42" x2="10" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="20" y1="30" x2="26" y2="42" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="26" y1="42" x2="30" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

function BrotherSvg() {
  return (
    <svg viewBox="0 0 40 56" className="w-12 h-16" fill="none">
      {/* Head */}
      <circle cx="20" cy="8" r="5.5" stroke="#e0e0e0" strokeWidth="1.5" fill="#12121a" />
      {/* Headphones */}
      <path d="M11 8 Q11 1 20 1 Q29 1 29 8" stroke="#888" strokeWidth="2" fill="none" />
      <circle cx="11" cy="9" r="2.5" fill="#1a1a2e" stroke="#888" strokeWidth="1" />
      <circle cx="29" cy="9" r="2.5" fill="#1a1a2e" stroke="#888" strokeWidth="1" />
      {/* Body - seated */}
      <line x1="20" y1="13" x2="20" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Arms on laptop */}
      <line x1="20" y1="19" x2="12" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="20" y1="19" x2="28" y2="28" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Laptop */}
      <rect x="8" y="28" width="24" height="2" fill="#1a1a2e" stroke="#888" strokeWidth="0.8" rx="0.5" />
      <path d="M12 28 L14 18 L26 18 L28 28" stroke="#888" strokeWidth="0.8" fill="#06060a" />
      {/* Screen content */}
      <rect x="16" y="21" width="8" height="1" fill="#00e676" opacity="0.4" />
      <rect x="15" y="23" width="10" height="1" fill="#00e676" opacity="0.3" />
      {/* Legs - seated */}
      <line x1="20" y1="30" x2="14" y2="40" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="14" y1="40" x2="12" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="20" y1="30" x2="26" y2="40" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="26" y1="40" x2="28" y2="54" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

function CatSvg() {
  return (
    <svg viewBox="0 0 32 20" className="w-10 h-6" fill="none">
      {/* Body */}
      <ellipse cx="16" cy="13" rx="10" ry="5" fill="#1a1a2e" stroke="#e0e0e0" strokeWidth="1" />
      {/* Head */}
      <circle cx="26" cy="10" r="4" fill="#1a1a2e" stroke="#e0e0e0" strokeWidth="1" />
      {/* Ears - triangles */}
      <path d="M24 7 L23 3 L26 6" stroke="#e0e0e0" strokeWidth="1" fill="#1a1a2e" />
      <path d="M28 7 L29 3 L26 6" stroke="#e0e0e0" strokeWidth="1" fill="#1a1a2e" />
      {/* Eyes */}
      <circle cx="25" cy="9.5" r="0.8" fill="#ffab00" />
      <circle cx="28" cy="9.5" r="0.8" fill="#ffab00" />
      {/* Tail */}
      <path d="M6 12 Q2 6 4 4" stroke="#e0e0e0" strokeWidth="1" fill="none" />
      {/* Legs */}
      <line x1="11" y1="17" x2="11" y2="20" stroke="#e0e0e0" strokeWidth="1" />
      <line x1="14" y1="17" x2="14" y2="20" stroke="#e0e0e0" strokeWidth="1" />
      <line x1="19" y1="17" x2="19" y2="20" stroke="#e0e0e0" strokeWidth="1" />
      <line x1="22" y1="17" x2="22" y2="20" stroke="#e0e0e0" strokeWidth="1" />
    </svg>
  )
}

// --- Reusable item button (follows Apartment's ApartmentItem pattern) ---

function MamadItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  cooldownPct,
  statusText,
}: {
  icon: typeof Package
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
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer ${
        disabled
          ? 'border-noir-border/50 bg-noir-card/30 opacity-50 cursor-not-allowed'
          : 'border-noir-border bg-noir-card/60 hover:border-neon-amber/50 hover:shadow-[0_0_15px_rgba(255,171,0,0.15)]'
      }`}
    >
      <Icon size={22} className={disabled ? 'text-text-muted/50' : 'text-neon-amber'} />
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      {cooldownPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-noir-border rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-neon-amber/60 transition-all duration-300"
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

// --- NPC clickable button ---

function NpcButton({
  children,
  label,
  onClick,
  disabled,
  cooldownPct,
  statusText,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled: boolean
  cooldownPct: number
  statusText: string | null
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.93 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
        disabled
          ? 'border-noir-border/50 bg-noir-card/20 opacity-50 cursor-not-allowed'
          : 'border-noir-border/70 bg-noir-card/40 hover:border-neon-amber/40 hover:shadow-[0_0_12px_rgba(255,171,0,0.1)]'
      }`}
    >
      {children}
      <span className="text-[9px] text-text-muted uppercase tracking-wider">{label}</span>
      {cooldownPct > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-noir-border rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-neon-amber/60 transition-all duration-300"
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
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-neon-green whitespace-nowrap z-10"
          >
            {statusText}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// --- Brother choice modal ---

function BrotherChoiceModal({
  onShutUp,
  onCoffee,
  onClose,
  suppliesLow,
}: {
  onShutUp: () => void
  onCoffee: () => void
  onClose: () => void
  suppliesLow: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-noir-bg/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-noir-card border border-noir-border rounded-lg p-4 flex flex-col gap-3 max-w-xs"
      >
        <p className="text-xs text-text-muted text-center">Your brother is on a Zoom call...</p>
        <button
          onClick={onShutUp}
          className="px-4 py-2 rounded border border-alert-red/50 bg-noir-surface text-xs text-alert-red hover:bg-alert-red/10 transition-colors cursor-pointer"
        >
          Tell him to shut up
        </button>
        <button
          onClick={onCoffee}
          disabled={suppliesLow}
          className={`px-4 py-2 rounded border text-xs transition-colors cursor-pointer ${
            suppliesLow
              ? 'border-noir-border/50 text-text-muted/50 cursor-not-allowed'
              : 'border-neon-green/50 bg-noir-surface text-neon-green hover:bg-neon-green/10'
          }`}
        >
          Bring him coffee {suppliesLow ? '(not enough supplies)' : '(-2 supplies, +8 morale)'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// --- Main Component ---

export function MamadRoom({
  sanity,
  upgrades,
  familyMorale,
  supplies,
  mamadDay,
  onSanityChange,
  onFamilyMoraleChange,
  onSuppliesChange,
  onBatteryChange,
  onAdvanceDay,
}: MamadRoomProps) {
  // Status text for each interaction
  const [momText, setMomText] = useState<string | null>(null)
  const [dadText, setDadText] = useState<string | null>(null)
  const [brotherText, setBrotherText] = useState<string | null>(null)
  const [catText, setCatText] = useState<string | null>(null)
  const [supplyText, setSupplyText] = useState<string | null>(null)
  const [radioText, setRadioText] = useState<string | null>(null)
  const [chargerText, setChargerText] = useState<string | null>(null)
  const [cardText, setCardText] = useState<string | null>(null)

  // Brother choice modal
  const [brotherChoiceOpen, setBrotherChoiceOpen] = useState(false)

  // Cooldowns in ms
  const [momCooldown, setMomCooldown] = useState(0)
  const [dadCooldown, setDadCooldown] = useState(0)
  const [brotherCooldown, setBrotherCooldown] = useState(0)
  const [catCooldown, setCatCooldown] = useState(0)
  const [supplyCooldown, setSupplyCooldown] = useState(0)
  const [radioCooldown, setRadioCooldown] = useState(0)
  const [chargerCooldown, setChargerCooldown] = useState(0)
  const [cardCooldown, setCardCooldown] = useState(0)

  const momMax = 10000
  const dadMax = 15000
  const brotherMax = 20000
  const catMax = 25000
  const supplyMax = 15000
  const radioMax = 12000
  const chargerMax = 60000
  const cardMax = 30000

  // Distant rumble flash effect
  const [flash, setFlash] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const scheduleFlash = () => {
      flashTimer.current = setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 120)
        scheduleFlash()
      }, 8000 + Math.random() * 20000)
    }
    scheduleFlash()
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current) }
  }, [])

  // Cooldown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setMomCooldown(prev => Math.max(0, prev - 100))
      setDadCooldown(prev => Math.max(0, prev - 100))
      setBrotherCooldown(prev => Math.max(0, prev - 100))
      setCatCooldown(prev => Math.max(0, prev - 100))
      setSupplyCooldown(prev => Math.max(0, prev - 100))
      setRadioCooldown(prev => Math.max(0, prev - 100))
      setChargerCooldown(prev => Math.max(0, prev - 100))
      setCardCooldown(prev => Math.max(0, prev - 100))
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const showStatus = useCallback((setter: (v: string | null) => void, text: string, duration = 2000) => {
    setter(text)
    setTimeout(() => setter(null), duration)
  }, [])

  const pickRandom = useCallback((arr: string[]) => arr[Math.floor(Math.random() * arr.length)], [])

  // --- Handlers ---

  const handleMom = useCallback(() => {
    if (momCooldown > 0) return
    onSanityChange(prev => prev - 3)
    onFamilyMoraleChange(prev => Math.min(100, prev + 5))
    setMomCooldown(momMax)
    showStatus(setMomText, pickRandom(momLines))
  }, [momCooldown, onSanityChange, onFamilyMoraleChange, showStatus, pickRandom])

  const handleDad = useCallback(() => {
    if (dadCooldown > 0) return
    onSanityChange(prev => prev - 5)
    onFamilyMoraleChange(prev => Math.min(100, prev + 3))
    setDadCooldown(dadMax)
    showStatus(setDadText, pickRandom(dadNewsLines))
  }, [dadCooldown, onSanityChange, onFamilyMoraleChange, showStatus, pickRandom])

  const handleBrother = useCallback(() => {
    if (brotherCooldown > 0) return
    setBrotherChoiceOpen(true)
  }, [brotherCooldown])

  const handleBrotherShutUp = useCallback(() => {
    onFamilyMoraleChange(prev => Math.max(0, prev - 5))
    setBrotherCooldown(brotherMax)
    setBrotherChoiceOpen(false)
    showStatus(setBrotherText, '-5 Morale')
  }, [onFamilyMoraleChange, showStatus])

  const handleBrotherCoffee = useCallback(() => {
    onFamilyMoraleChange(prev => Math.min(100, prev + 8))
    onSuppliesChange(prev => Math.max(0, prev - 2))
    setBrotherCooldown(brotherMax)
    setBrotherChoiceOpen(false)
    showStatus(setBrotherText, '+8 Morale, -2 Supplies')
  }, [onFamilyMoraleChange, onSuppliesChange, showStatus])

  const handleCat = useCallback(() => {
    if (catCooldown > 0) return
    onSanityChange(prev => prev + 8)
    setCatCooldown(catMax)
    showStatus(setCatText, '+8 Sanity')
  }, [catCooldown, onSanityChange, showStatus])

  const handleSupply = useCallback(() => {
    if (supplyCooldown > 0 || supplies < 5) return
    onSuppliesChange(prev => prev - 5)
    onFamilyMoraleChange(prev => Math.min(100, prev + 10))
    setSupplyCooldown(supplyMax)
    showStatus(setSupplyText, '-5 Supplies, +10 Morale')
  }, [supplyCooldown, supplies, onSuppliesChange, onFamilyMoraleChange, showStatus])

  const handleRadio = useCallback(() => {
    if (radioCooldown > 0) return
    onSanityChange(prev => prev - 2)
    onFamilyMoraleChange(prev => Math.min(100, prev + 3))
    setRadioCooldown(radioMax)
    showStatus(setRadioText, pickRandom(radioLines), 2500)
  }, [radioCooldown, onSanityChange, onFamilyMoraleChange, showStatus, pickRandom])

  const handleCharger = useCallback(() => {
    if (chargerCooldown > 0) return
    onBatteryChange(prev => prev + 10)
    setChargerCooldown(chargerMax)
    showStatus(setChargerText, '+10 Battery')
  }, [chargerCooldown, showStatus])

  const handleCards = useCallback(() => {
    if (cardCooldown > 0) return
    onSanityChange(prev => prev + 5)
    onFamilyMoraleChange(prev => Math.min(100, prev + 8))
    setCardCooldown(cardMax)
    showStatus(setCardText, '+5 Sanity, +8 Morale')
  }, [cardCooldown, onSanityChange, onFamilyMoraleChange, showStatus])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col flex-1 relative overflow-hidden"
    >
      {/* Dim amber lighting overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-neon-amber/[0.03] via-transparent to-neon-amber/[0.05]" />

      {/* Distant rumble flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="absolute inset-0 bg-alert-red/20 z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Day counter header */}
      <div className="px-4 pt-3 pb-2 border-b border-noir-border/60 bg-noir-surface/80">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neon-amber/80 uppercase tracking-widest font-bold">
            Day {mamadDay} in the Mamad
          </span>
          <button
            onClick={onAdvanceDay}
            className="text-[10px] text-text-muted/60 uppercase tracking-wider border border-noir-border/50 rounded px-2 py-1 hover:border-neon-amber/30 hover:text-text-muted transition-colors cursor-pointer"
          >
            End Day
          </button>
        </div>
      </div>

      {/* Mamad room - cramped, dark */}
      <div className="flex-1 p-3 flex flex-col gap-2 bg-noir-surface/60 relative">
        {/* Walls effect - visible borders to feel enclosed */}
        <div className="absolute inset-0 border-4 border-noir-card/80 rounded pointer-events-none" />
        <div className="absolute inset-1 border border-noir-border/30 rounded pointer-events-none" />

        {/* NPC Grid - 2x2, cramped, slightly overlapping */}
        <div className="grid grid-cols-2 gap-1.5 relative z-0">
          {/* Mom - top left */}
          <NpcButton
            label="Mom"
            onClick={handleMom}
            disabled={momCooldown > 0 || sanity <= 0}
            cooldownPct={(momCooldown / momMax) * 100}
            statusText={momText}
          >
            <motion.div
              animate={{ x: [0, -1, 1, -1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MomSvg />
            </motion.div>
          </NpcButton>

          {/* Dad - top right */}
          <NpcButton
            label="Dad"
            onClick={handleDad}
            disabled={dadCooldown > 0 || sanity <= 0}
            cooldownPct={(dadCooldown / dadMax) * 100}
            statusText={dadText}
          >
            <DadSvg />
          </NpcButton>

          {/* Card game - bottom left */}
          <NpcButton
            label="Cards"
            onClick={handleCards}
            disabled={cardCooldown > 0}
            cooldownPct={(cardCooldown / cardMax) * 100}
            statusText={cardText}
          >
            <Dices size={24} className={cardCooldown > 0 ? 'text-text-muted/50' : 'text-neon-amber'} />
          </NpcButton>

          {/* Brother - bottom right */}
          <NpcButton
            label="Brother"
            onClick={handleBrother}
            disabled={brotherCooldown > 0}
            cooldownPct={(brotherCooldown / brotherMax) * 100}
            statusText={brotherText}
          >
            <BrotherSvg />
          </NpcButton>
        </div>

        {/* Cat - wandering at bottom of room */}
        <div className="flex justify-center -mt-1">
          <NpcButton
            label="Cat"
            onClick={handleCat}
            disabled={catCooldown > 0}
            cooldownPct={(catCooldown / catMax) * 100}
            statusText={catText}
          >
            <motion.div
              animate={{ y: [0, -3, 0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CatSvg />
            </motion.div>
          </NpcButton>
        </div>

        {/* Interactive Items Row */}
        <div className="grid grid-cols-3 gap-1.5 mt-auto">
          {/* Supply Shelf */}
          <div className="relative">
            <MamadItem
              icon={Package}
              label="Supplies"
              onClick={handleSupply}
              disabled={supplyCooldown > 0 || supplies < 5}
              cooldownPct={(supplyCooldown / supplyMax) * 100}
              statusText={supplyText}
            />
            {supplies < 10 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-alert-red whitespace-nowrap animate-pulse">
                Running low!
              </span>
            )}
          </div>

          {/* Radio */}
          <MamadItem
            icon={Radio}
            label="Radio"
            onClick={handleRadio}
            disabled={radioCooldown > 0}
            cooldownPct={(radioCooldown / radioMax) * 100}
            statusText={radioText}
          />

          {/* Phone Charger - only if powerbank upgrade */}
          {upgrades.powerbank ? (
            <MamadItem
              icon={BatteryCharging}
              label="Charger"
              onClick={handleCharger}
              disabled={chargerCooldown > 0}
              cooldownPct={(chargerCooldown / chargerMax) * 100}
              statusText={chargerText}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-noir-border/30 bg-noir-card/20 opacity-30">
              <BatteryCharging size={22} className="text-text-muted/30" />
              <span className="text-[9px] text-text-muted/30 uppercase tracking-wider mt-1">No Powerbank</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bars */}
      <div className="px-4 py-2 border-t border-noir-border/60 bg-noir-surface/80 flex gap-4">
        {/* Supplies bar */}
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-text-muted uppercase tracking-wider">Supplies</span>
            <span className={`text-[9px] ${supplies < 20 ? 'text-alert-red' : 'text-text-muted'}`}>
              {supplies}%
            </span>
          </div>
          <div className="h-1.5 bg-noir-card rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                supplies < 20 ? 'bg-alert-red' : supplies < 50 ? 'bg-neon-amber' : 'bg-neon-green'
              }`}
              style={{ width: `${supplies}%` }}
            />
          </div>
        </div>

        {/* Family Morale bar */}
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-text-muted uppercase tracking-wider">Morale</span>
            <span className={`text-[9px] ${familyMorale < 20 ? 'text-alert-red' : 'text-text-muted'}`}>
              {familyMorale}%
            </span>
          </div>
          <div className="h-1.5 bg-noir-card rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                familyMorale < 20 ? 'bg-alert-red' : familyMorale < 50 ? 'bg-neon-amber' : 'bg-neon-green'
              }`}
              style={{ width: `${familyMorale}%` }}
            />
          </div>
        </div>
      </div>

      {/* Brother choice modal */}
      <AnimatePresence>
        {brotherChoiceOpen && (
          <BrotherChoiceModal
            onShutUp={handleBrotherShutUp}
            onCoffee={handleBrotherCoffee}
            onClose={() => setBrotherChoiceOpen(false)}
            suppliesLow={supplies < 2}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
