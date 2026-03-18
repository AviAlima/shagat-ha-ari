import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface MamadArrivalProps {
  onContinue: () => void
}

function FamilySilhouettes() {
  return (
    <svg viewBox="0 0 120 80" className="w-48 h-32" fill="none">
      {/* Mom */}
      <circle cx="30" cy="20" r="8" fill="#1a1a2e" stroke="#888" strokeWidth="1" />
      <line x1="30" y1="28" x2="30" y2="52" stroke="#888" strokeWidth="1.5" />
      <line x1="30" y1="35" x2="22" y2="45" stroke="#888" strokeWidth="1.5" />
      <line x1="30" y1="35" x2="38" y2="45" stroke="#888" strokeWidth="1.5" />
      <line x1="30" y1="52" x2="24" y2="72" stroke="#888" strokeWidth="1.5" />
      <line x1="30" y1="52" x2="36" y2="72" stroke="#888" strokeWidth="1.5" />
      {/* Label */}
      <text x="30" y="78" textAnchor="middle" fill="#888" fontSize="6">Mom</text>

      {/* Dad */}
      <circle cx="60" cy="16" r="9" fill="#1a1a2e" stroke="#888" strokeWidth="1" />
      <line x1="60" y1="25" x2="60" y2="52" stroke="#888" strokeWidth="1.5" />
      <line x1="60" y1="33" x2="50" y2="45" stroke="#888" strokeWidth="1.5" />
      <line x1="60" y1="33" x2="70" y2="45" stroke="#888" strokeWidth="1.5" />
      <line x1="60" y1="52" x2="53" y2="72" stroke="#888" strokeWidth="1.5" />
      <line x1="60" y1="52" x2="67" y2="72" stroke="#888" strokeWidth="1.5" />
      <text x="60" y="78" textAnchor="middle" fill="#888" fontSize="6">Dad</text>

      {/* Brother */}
      <circle cx="90" cy="22" r="7" fill="#1a1a2e" stroke="#888" strokeWidth="1" />
      <line x1="90" y1="29" x2="90" y2="50" stroke="#888" strokeWidth="1.5" />
      <line x1="90" y1="36" x2="83" y2="44" stroke="#888" strokeWidth="1.5" />
      <line x1="90" y1="36" x2="97" y2="44" stroke="#888" strokeWidth="1.5" />
      <line x1="90" y1="50" x2="84" y2="70" stroke="#888" strokeWidth="1.5" />
      <line x1="90" y1="50" x2="96" y2="70" stroke="#888" strokeWidth="1.5" />
      <text x="90" y="78" textAnchor="middle" fill="#888" fontSize="6">Brother</text>
    </svg>
  )
}

export function MamadArrival({ onContinue }: MamadArrivalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Enter') {
      onContinue()
    }
  }, [onContinue])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative">
      {/* Ambient green glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className="p-4 rounded-full bg-neon-green/10 border border-neon-green/30">
          <Shield size={40} className="text-neon-green" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-neon-green mb-2 text-center"
      >
        You Arrived at Your Parents' House
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-text-muted mb-2 text-center max-w-xs"
      >
        Modi'in. The familiar street feels different now.
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-text-muted mb-8 text-center max-w-xs"
      >
        The mamad is cramped. Your family is already inside.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <FamilySilhouettes />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
        className="text-xs text-text-muted uppercase tracking-widest cursor-pointer"
        onClick={onContinue}
      >
        Press ENTER to continue
      </motion.div>
    </div>
  )
}
