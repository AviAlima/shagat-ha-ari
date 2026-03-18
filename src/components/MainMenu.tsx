import { motion } from 'framer-motion'
import { Siren, Shield, Zap, ChevronRight } from 'lucide-react'

interface MainMenuProps {
  onStart: () => void
}

function LionSvg() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mane */}
      <ellipse cx="60" cy="55" rx="45" ry="42" fill="#1a1a2e" stroke="#ff1744" strokeWidth="1.5" />
      <ellipse cx="60" cy="55" rx="38" ry="36" fill="#0a0a0f" stroke="#ff174480" strokeWidth="1" />
      {/* Mane rays */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 60 + Math.cos(angle) * 36
        const y1 = 55 + Math.sin(angle) * 34
        const x2 = 60 + Math.cos(angle) * 45
        const y2 = 55 + Math.sin(angle) * 42
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff1744" strokeWidth="1.5" opacity="0.5" />
      })}
      {/* Face */}
      <ellipse cx="60" cy="58" rx="22" ry="20" fill="#12121a" stroke="#ff1744" strokeWidth="1" />
      {/* Eyes */}
      <ellipse cx="51" cy="52" rx="4" ry="3" fill="#ff1744" opacity="0.9" />
      <ellipse cx="69" cy="52" rx="4" ry="3" fill="#ff1744" opacity="0.9" />
      <circle cx="52" cy="51.5" r="1.5" fill="#fff" opacity="0.8" />
      <circle cx="70" cy="51.5" r="1.5" fill="#fff" opacity="0.8" />
      {/* Nose */}
      <path d="M57 60 L60 63 L63 60" stroke="#ff1744" strokeWidth="1.5" fill="none" />
      {/* Mouth — roaring */}
      <path d="M50 66 Q55 74 60 74 Q65 74 70 66" stroke="#ff1744" strokeWidth="1.5" fill="#1a1a2e" />
      {/* Fangs */}
      <line x1="53" y1="66" x2="54" y2="70" stroke="#e0e0e0" strokeWidth="1.5" />
      <line x1="67" y1="66" x2="66" y2="70" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Hebrew letter Alef on forehead */}
      <text x="60" y="47" textAnchor="middle" fill="#ff1744" fontSize="10" fontFamily="serif" opacity="0.6">א</text>
    </svg>
  )
}

export function MainMenu({ onStart }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-alert-red/5 rounded-full blur-3xl" />

      {/* Lion emblem */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="animate-pulse-red rounded-full p-1">
          <LionSvg />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-alert-red tracking-tight text-center mb-2"
      >
        שאגת האריה
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-lg text-text-muted tracking-widest uppercase mb-1"
      >
        Sha'agat Ha-Ari
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-xs text-text-muted/60 mb-10"
      >
        Tel Aviv, March 2026 — A Survival Game
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex gap-3 mb-10 flex-wrap justify-center"
      >
        {[
          { icon: Siren, label: '60s Siren Drills' },
          { icon: Shield, label: 'Shelter Runs' },
          { icon: Zap, label: 'Battery Management' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-noir-border bg-noir-card/50 text-xs text-text-muted"
          >
            <Icon size={12} className="text-alert-red" />
            {label}
          </div>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="group flex items-center gap-2 px-8 py-3 bg-alert-red text-white font-bold text-sm uppercase tracking-widest rounded border-none cursor-pointer animate-pulse-red hover:bg-alert-red/90 transition-colors"
      >
        Start Survival
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-12 text-[10px] text-text-muted/40 text-center"
      >
        This is a fictional survival game. Stay safe. Follow Home Front Command instructions.
      </motion.p>
    </div>
  )
}
