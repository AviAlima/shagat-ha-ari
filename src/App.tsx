import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NewsTicker } from './components/NewsTicker'
import { StatsBar } from './components/StatsBar'
import { MainMenu } from './components/MainMenu'
import { Apartment } from './components/Apartment'
import { SirenAlert } from './components/SirenAlert'
import { PackingGame } from './components/PackingGame'
import { ShelterRun } from './components/ShelterRun'
import { ShelterSafe } from './components/ShelterSafe'
import { GameOver } from './components/GameOver'
import { EvacuationChoice } from './components/EvacuationChoice'
import { DrivingGame } from './components/DrivingGame'
import { MamadArrival } from './components/MamadArrival'
import { MamadRoom } from './components/MamadRoom'
import { MamadEvent, MAMAD_EVENTS } from './components/MamadEvent'
import type { MamadEventData } from './components/MamadEvent'
import { MamadGameOver } from './components/MamadGameOver'
import { useGameState } from './hooks/useGameState'

function App() {
  const game = useGameState()
  const sirenTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const batteryRef = useRef(game.battery)
  const sirensSurvivedRef = useRef(game.sirensSurvived)
  batteryRef.current = game.battery
  sirensSurvivedRef.current = game.sirensSurvived

  const {
    setGamePhase, setSirenCountdown, setInventory, setSirensSurvived,
    setSanity, setBattery, setCash, setUpgrade, advanceTime, resetGame,
    setFamilyMorale, setSupplies, setMamadDay,
  } = game

  // Phase 3 event system
  const [currentEvent, setCurrentEvent] = useState<MamadEventData | null>(null)
  const [mamadGameOverReason, setMamadGameOverReason] = useState<'sanity' | 'supplies' | 'morale' | 'survived' | null>(null)
  const eventTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const scheduleEvent = useCallback(() => {
    const delay = 20000 + Math.random() * 25000 // 20-45 seconds between events
    eventTimerRef.current = setTimeout(() => {
      const event = MAMAD_EVENTS[Math.floor(Math.random() * MAMAD_EVENTS.length)]
      setCurrentEvent(event)
    }, delay)
  }, [])

  // Schedule mamad events when in phase3
  useEffect(() => {
    if (game.gamePhase === 'phase3' && !currentEvent) {
      scheduleEvent()
    }
    return () => {
      if (eventTimerRef.current) clearTimeout(eventTimerRef.current)
    }
  }, [game.gamePhase, currentEvent, scheduleEvent])

  // Check Phase 3 lose/win conditions
  useEffect(() => {
    if (game.gamePhase !== 'phase3') return
    if (game.sanity <= 0) {
      setMamadGameOverReason('sanity')
      setGamePhase('mamad_gameover')
    } else if (game.supplies <= 0) {
      setMamadGameOverReason('supplies')
      setGamePhase('mamad_gameover')
    } else if (game.familyMorale <= 0) {
      setMamadGameOverReason('morale')
      setGamePhase('mamad_gameover')
    } else if (game.mamadDay >= 8) {
      setMamadGameOverReason('survived')
      setGamePhase('mamad_gameover')
    }
  }, [game.gamePhase, game.sanity, game.supplies, game.familyMorale, game.mamadDay, setGamePhase])

  const handleEventChoice = useCallback((effects: { sanity?: number; morale?: number; supplies?: number; battery?: number }) => {
    if (effects.sanity) setSanity(prev => prev + effects.sanity!)
    if (effects.morale) setFamilyMorale(prev => prev + effects.morale!)
    if (effects.supplies) setSupplies(prev => prev + effects.supplies!)
    if (effects.battery) setBattery(prev => prev + effects.battery!)
    setCurrentEvent(null)
  }, [setSanity, setFamilyMorale, setSupplies, setBattery])

  const handleAdvanceDay = useCallback(() => {
    setMamadDay(prev => prev + 1)
    // Small passive drain on day advance
    setSupplies(prev => prev - 3)
    setSanity(prev => prev - 2)
  }, [setMamadDay, setSupplies, setSanity])

  // Siren scheduling for apartment phase
  const scheduleSiren = useCallback(() => {
    let baseMin: number, baseRange: number
    if (sirensSurvivedRef.current === 0) {
      // First siren comes fast — let the player barely settle in
      baseMin = 8000
      baseRange = 7000  // 8-15s
    } else if (sirensSurvivedRef.current >= 3) {
      // After evacuation choice (stayed) — intense
      baseMin = 15000
      baseRange = 10000 // 15-25s
    } else {
      // Normal sirens — quicker than before
      baseMin = 20000
      baseRange = 20000 // 20-40s
    }
    const delay = baseMin + Math.random() * baseRange
    sirenTimerRef.current = setTimeout(() => {
      const maxCountdown = batteryRef.current > 0 ? 60 : 15
      setSirenCountdown(() => maxCountdown)
      setGamePhase('siren')
    }, delay)
  }, [setGamePhase, setSirenCountdown])

  useEffect(() => {
    if (game.gamePhase === 'apartment') {
      scheduleSiren()
    }
    return () => {
      if (sirenTimerRef.current) clearTimeout(sirenTimerRef.current)
    }
  }, [game.gamePhase, scheduleSiren])

  const handleStart = useCallback(() => {
    setGamePhase('apartment')
  }, [setGamePhase])

  const handleCountdownTick = useCallback(() => {
    setSirenCountdown((prev: number) => Math.max(0, prev - 1))
  }, [setSirenCountdown])

  const handlePackingStart = useCallback(() => {
    setGamePhase('packing')
  }, [setGamePhase])

  const handlePackingDone = useCallback((items: string[]) => {
    setInventory(items)
    setGamePhase('running')
  }, [setInventory, setGamePhase])

  const handleReachShelter = useCallback(() => {
    setSirensSurvived(prev => prev + 1)
    setGamePhase('shelter')
  }, [setSirensSurvived, setGamePhase])

  const handleFail = useCallback(() => {
    setGamePhase('gameover')
  }, [setGamePhase])

  const handleContinue = useCallback(() => {
    setInventory([])
    if (sirensSurvivedRef.current >= 3) {
      setGamePhase('evacuation_choice')
    } else {
      setGamePhase('apartment')
    }
  }, [setInventory, setGamePhase])

  const handleStay = useCallback(() => {
    setGamePhase('apartment')
  }, [setGamePhase])

  const handleDrive = useCallback(() => {
    setGamePhase('driving')
  }, [setGamePhase])

  const handleDrivingComplete = useCallback(() => {
    setGamePhase('mamad_arrival')
  }, [setGamePhase])

  const handleMamadContinue = useCallback(() => {
    setGamePhase('phase3')
  }, [setGamePhase])

  const handleRetry = useCallback(() => {
    setCurrentEvent(null)
    setMamadGameOverReason(null)
    resetGame()
  }, [resetGame])

  const showStats = game.gamePhase !== 'menu'

  return (
    <div className={`flex flex-col min-h-screen bg-noir-bg ${
      game.sanity < 10 ? 'sanity-critical' : game.sanity < 20 ? 'sanity-low' : game.sanity < 35 ? 'sanity-uneasy' : ''
    }`}>
      <div className="crt-overlay" />
      <NewsTicker />
      {showStats && <StatsBar sanity={game.sanity} battery={game.battery} cash={game.cash} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={game.gamePhase}
          initial={{ opacity: 0, x: Math.random() > 0.5 ? -8 : 8, filter: 'hue-rotate(20deg) brightness(1.5)' }}
          animate={{ opacity: 1, x: 0, filter: 'hue-rotate(0deg) brightness(1)' }}
          exit={{ opacity: 0, x: Math.random() > 0.5 ? 8 : -8, filter: 'saturate(0) brightness(0.5)' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col flex-1"
        >
          {game.gamePhase === 'menu' && (
            <MainMenu onStart={handleStart} />
          )}

          {game.gamePhase === 'apartment' && (
            <Apartment
              sanity={game.sanity}
              battery={game.battery}
              cash={game.cash}
              upgrades={game.upgrades}
              onSanityChange={setSanity}
              onCashChange={setCash}
              onUpgrade={setUpgrade}
              onAdvanceTime={advanceTime}
            />
          )}

          {game.gamePhase === 'siren' && (
            <SirenAlert
              countdown={game.sirenCountdown}
              onCountdownTick={handleCountdownTick}
              onPackingStart={handlePackingStart}
            />
          )}

          {game.gamePhase === 'packing' && (
            <PackingGame
              countdown={game.sirenCountdown}
              onCountdownTick={handleCountdownTick}
              onDone={handlePackingDone}
            />
          )}

          {game.gamePhase === 'running' && (
            <ShelterRun
              countdown={game.sirenCountdown}
              hasSneakers={game.upgrades.sneakers}
              onCountdownTick={handleCountdownTick}
              onReachShelter={handleReachShelter}
              onFail={handleFail}
            />
          )}

          {game.gamePhase === 'shelter' && (
            <ShelterSafe
              inventory={game.inventory}
              timeSurvived={game.timeSurvived}
              onContinue={handleContinue}
            />
          )}

          {game.gamePhase === 'evacuation_choice' && (
            <EvacuationChoice
              onStay={handleStay}
              onDrive={handleDrive}
            />
          )}

          {game.gamePhase === 'driving' && (
            <DrivingGame
              sanity={game.sanity}
              onSanityChange={setSanity}
              onComplete={handleDrivingComplete}
              onFail={handleFail}
            />
          )}

          {game.gamePhase === 'mamad_arrival' && (
            <MamadArrival
              onContinue={handleMamadContinue}
            />
          )}

          {game.gamePhase === 'phase3' && (
            <MamadRoom
              sanity={game.sanity}
              battery={game.battery}
              cash={game.cash}
              upgrades={game.upgrades}
              familyMorale={game.familyMorale}
              supplies={game.supplies}
              mamadDay={game.mamadDay}
              onSanityChange={setSanity}
              onFamilyMoraleChange={setFamilyMorale}
              onSuppliesChange={setSupplies}
              onBatteryChange={setBattery}
              onAdvanceDay={handleAdvanceDay}
            />
          )}

          {game.gamePhase === 'mamad_gameover' && mamadGameOverReason && (
            <MamadGameOver
              reason={mamadGameOverReason}
              daysInMamad={game.mamadDay}
              timeSurvived={game.timeSurvived}
              onRetry={handleRetry}
            />
          )}

          {game.gamePhase === 'gameover' && (
            <GameOver
              timeSurvived={game.timeSurvived}
              cashEarned={game.cashEarned}
              inventory={game.inventory}
              onRetry={handleRetry}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Phase 3 event overlay — renders on top of MamadRoom */}
      {game.gamePhase === 'phase3' && currentEvent && (
        <MamadEvent event={currentEvent} onChoice={handleEventChoice} />
      )}
    </div>
  )
}

export default App
