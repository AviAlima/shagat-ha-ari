import { useState, useCallback, useEffect, useRef } from 'react'

export type GamePhase = 'menu' | 'apartment' | 'siren' | 'packing' | 'running' | 'shelter' | 'gameover' | 'evacuation_choice' | 'driving' | 'mamad_arrival' | 'phase3' | 'mamad_gameover'

export interface Upgrades {
  sneakers: boolean
  powerbank: boolean
  premiumCoffee: boolean
}

export interface GameState {
  sanity: number
  battery: number
  cash: number
  inventory: string[]
  upgrades: Upgrades
  gamePhase: GamePhase
  sirenCountdown: number
  timeOfDay: number
  timeSurvived: number
  cashEarned: number
  sirensSurvived: number
  distance: number
  familyMorale: number
  supplies: number
  mamadDay: number
}

export interface GameActions {
  setSanity: (fn: (prev: number) => number) => void
  setBattery: (fn: (prev: number) => number) => void
  setCash: (fn: (prev: number) => number) => void
  setInventory: (items: string[]) => void
  setUpgrade: (key: keyof Upgrades) => void
  setGamePhase: (phase: GamePhase) => void
  setSirenCountdown: (value: number | ((prev: number) => number)) => void
  advanceTime: () => void
  resetGame: () => void
  setSirensSurvived: (fn: (prev: number) => number) => void
  setDistance: (fn: (prev: number) => number) => void
  setFamilyMorale: (fn: (prev: number) => number) => void
  setSupplies: (fn: (prev: number) => number) => void
  setMamadDay: (fn: (prev: number) => number) => void
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

export function useGameState(): GameState & GameActions {
  const [sanity, setSanityRaw] = useState(55)
  const [battery, setBatteryRaw] = useState(60)
  const [cash, setCashRaw] = useState(60)
  const [inventory, setInventory] = useState<string[]>([])
  const [upgrades, setUpgrades] = useState<Upgrades>({
    sneakers: false,
    powerbank: false,
    premiumCoffee: false,
  })
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu')
  const [sirenCountdown, setSirenCountdown] = useState(60)
  const [timeOfDay, setTimeOfDay] = useState(0)
  const [timeSurvived, setTimeSurvived] = useState(0)
  const [cashEarned, setCashEarned] = useState(0)
  const [sirensSurvived, setSirensSurvivedRaw] = useState(0)
  const [distance, setDistanceRaw] = useState(0)
  const [familyMorale, setFamilyMoraleRaw] = useState(50)
  const [supplies, setSuppliesRaw] = useState(50)
  const [mamadDay, setMamadDayRaw] = useState(1)

  const upgradesRef = useRef(upgrades)
  upgradesRef.current = upgrades

  const gamePhaseRef = useRef(gamePhase)
  gamePhaseRef.current = gamePhase

  const setSanity = useCallback((fn: (prev: number) => number) => {
    setSanityRaw(prev => clamp(fn(prev), 0, 100))
  }, [])

  const setBattery = useCallback((fn: (prev: number) => number) => {
    setBatteryRaw(prev => clamp(fn(prev), 0, 100))
  }, [])

  const setCash = useCallback((fn: (prev: number) => number) => {
    setCashRaw(prev => {
      const next = fn(prev)
      if (next > prev) {
        setCashEarned(e => e + (next - prev))
      }
      return Math.max(0, next)
    })
  }, [])

  const setSirensSurvived = useCallback((fn: (prev: number) => number) => {
    setSirensSurvivedRaw(prev => fn(prev))
  }, [])

  const setDistance = useCallback((fn: (prev: number) => number) => {
    setDistanceRaw(prev => clamp(fn(prev), 0, 60))
  }, [])

  const setFamilyMorale = useCallback((fn: (prev: number) => number) => {
    setFamilyMoraleRaw(prev => clamp(fn(prev), 0, 100))
  }, [])

  const setSupplies = useCallback((fn: (prev: number) => number) => {
    setSuppliesRaw(prev => clamp(fn(prev), 0, 100))
  }, [])

  const setMamadDay = useCallback((fn: (prev: number) => number) => {
    setMamadDayRaw(prev => fn(prev))
  }, [])

  const setUpgrade = useCallback((key: keyof Upgrades) => {
    setUpgrades(prev => ({ ...prev, [key]: true }))
  }, [])

  const advanceTime = useCallback(() => {
    setTimeOfDay(prev => prev + 1)
  }, [])

  const resetGame = useCallback(() => {
    setSanityRaw(55)
    setBatteryRaw(60)
    setCashRaw(60)
    setInventory([])
    setUpgrades({ sneakers: false, powerbank: false, premiumCoffee: false })
    setGamePhase('menu')
    setSirenCountdown(60)
    setTimeOfDay(0)
    setTimeSurvived(0)
    setCashEarned(0)
    setSirensSurvivedRaw(0)
    setDistanceRaw(0)
    setFamilyMoraleRaw(50)
    setSuppliesRaw(50)
    setMamadDayRaw(1)
  }, [])

  // Battery drain: -1 every 5s (or 10s with powerbank) — apartment and phase3
  useEffect(() => {
    if (gamePhase !== 'apartment' && gamePhase !== 'phase3') return
    const interval = upgradesRef.current.powerbank ? 10000 : 5000
    const timer = setInterval(() => {
      const phase = gamePhaseRef.current
      if (phase === 'apartment' || phase === 'phase3') {
        setBatteryRaw(prev => clamp(prev - 1, 0, 100))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [gamePhase, upgrades.powerbank])

  // Passive supply drain in phase3: -1 every 15s
  useEffect(() => {
    if (gamePhase !== 'phase3') return
    const timer = setInterval(() => {
      if (gamePhaseRef.current === 'phase3') {
        setSuppliesRaw(prev => clamp(prev - 1, 0, 100))
      }
    }, 8000)
    return () => clearInterval(timer)
  }, [gamePhase])

  // Passive morale drain in phase3: -1 every 12s
  useEffect(() => {
    if (gamePhase !== 'phase3') return
    const timer = setInterval(() => {
      if (gamePhaseRef.current === 'phase3') {
        setFamilyMoraleRaw(prev => clamp(prev - 1, 0, 100))
      }
    }, 12000)
    return () => clearInterval(timer)
  }, [gamePhase])

  // Time survived tracker
  useEffect(() => {
    if (gamePhase === 'menu' || gamePhase === 'gameover' || gamePhase === 'shelter' || gamePhase === 'mamad_gameover') return
    const timer = setInterval(() => {
      setTimeSurvived(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [gamePhase])

  return {
    sanity,
    battery,
    cash,
    inventory,
    upgrades,
    gamePhase,
    sirenCountdown,
    timeOfDay,
    timeSurvived,
    cashEarned,
    sirensSurvived,
    distance,
    familyMorale,
    supplies,
    mamadDay,
    setSanity,
    setBattery,
    setCash,
    setInventory,
    setUpgrade,
    setGamePhase,
    setSirenCountdown,
    advanceTime,
    resetGame,
    setSirensSurvived,
    setDistance,
    setFamilyMorale,
    setSupplies,
    setMamadDay,
  }
}
