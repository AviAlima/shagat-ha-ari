import { useState } from 'react'
import { NewsTicker } from './components/NewsTicker'
import { StatsBar } from './components/StatsBar'
import { MainMenu } from './components/MainMenu'

type GamePhase = 'menu' | 'phase1' | 'phase2' | 'phase3'

function App() {
  const [phase, setPhase] = useState<GamePhase>('menu')
  const [sanity] = useState(75)
  const [battery] = useState(88)
  const [cash] = useState(120)

  return (
    <div className="flex flex-col min-h-screen bg-noir-bg">
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* News ticker — always visible */}
      <NewsTicker />

      {/* Stats bar — visible once game starts */}
      {phase !== 'menu' && <StatsBar sanity={sanity} battery={battery} cash={cash} />}

      {/* Game content */}
      {phase === 'menu' && <MainMenu onStart={() => setPhase('phase1')} />}

      {phase === 'phase1' && (
        <div className="flex flex-col items-center justify-center flex-1 text-text-muted">
          <StatsBar sanity={sanity} battery={battery} cash={cash} />
          <p className="mt-8 text-sm">Phase 1: The Apartment — Coming soon...</p>
        </div>
      )}
    </div>
  )
}

export default App
