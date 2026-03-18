import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
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
import { useGameState } from './hooks/useGameState'

function App() {
  const game = useGameState()
  const sirenTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const batteryRef = useRef(game.battery)
  const sirensSurvivedRef = useRef(game.sirensSurvived)
  batteryRef.current = game.battery
  sirensSurvivedRef.current = game.sirensSurvived

  const { setGamePhase, setSirenCountdown, setInventory, setSirensSurvived, setSanity, setCash, setUpgrade, advanceTime, resetGame } = game

  const scheduleSiren = useCallback(() => {
    const baseMin = sirensSurvivedRef.current >= 3 ? 25000 : 45000
    const baseRange = sirensSurvivedRef.current >= 3 ? 25000 : 45000
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
    if (sirensSurvivedRef.current === 3) {
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
    resetGame()
  }, [resetGame])

  const showStats = game.gamePhase !== 'menu'

  return (
    <div className="flex flex-col min-h-screen bg-noir-bg">
      <div className="crt-overlay" />
      <NewsTicker />
      {showStats && <StatsBar sanity={game.sanity} battery={game.battery} cash={game.cash} />}

      <AnimatePresence mode="wait">
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
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
            <h1 className="text-2xl font-bold text-neon-amber mb-4">Phase 3: Coming Soon...</h1>
            <p className="text-sm text-text-muted text-center">
              Life in the mamad with your family. The war continues outside.
            </p>
          </div>
        )}

        {game.gamePhase === 'gameover' && (
          <GameOver
            timeSurvived={game.timeSurvived}
            cashEarned={game.cashEarned}
            inventory={game.inventory}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
