import { motion } from 'framer-motion'
import { Siren, Shield, Zap, ChevronRight } from 'lucide-react'

interface MainMenuProps {
  onStart: () => void
}

function LionSvg() {
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32 md:w-36 md:h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative overflow-hidden">
      {/* Aurora atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[42rem] h-[30rem] bg-alert-red/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-neon-blue/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-neon-amber/5 rounded-full blur-3xl" />
        {/* Stars */}
        {[
          { top: '12%', left: '15%', size: 2 },
          { top: '20%', left: '82%', size: 2 },
          { top: '30%', left: '8%', size: 1.5 },
          { top: '45%', left: '90%', size: 1.5 },
          { top: '10%', left: '55%', size: 1.5 },
          { top: '60%', left: '5%', size: 1 },
          { top: '70%', left: '92%', size: 1 },
        ].map((star, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-text-primary"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Lion emblem */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-7"
      >
        {/* Expanding pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border border-alert-red/30"
              style={{ width: 160 + i * 20, height: 160 + i * 20 }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.7, 1.25] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="animate-pulse-red rounded-full p-1.5 bg-noir-card/40">
          <LionSvg />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-5xl md:text-6xl font-black text-alert-red tracking-tight text-center mb-1 text-glow-red select-none"
      >
        שאגת האריה
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="text-sm md:text-base text-text-muted tracking-[0.35em] uppercase mb-1.5 font-mono"
      >
        Sha'agat Ha-Ari
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="text-xs text-text-muted/60 mb-10"
      >
        תל אביב, מרץ 2026 — משחק הישרדות
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex gap-2.5 mb-10 flex-wrap justify-center"
      >
        {[
          { icon: Siren, label: '60 שניות למקלט' },
          { icon: Shield, label: 'ניהול סוללה' },
          { icon: Zap, label: 'ספירת שפיות' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-noir-border bg-noir-card/60 text-xs text-text-muted backdrop-blur-sm"
          >
            <Icon size={13} className="text-alert-red" />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="btn-game btn-primary group flex items-center gap-2.5 px-12 py-4 text-sm font-bold"
      >
        <span className="text-lg leading-none">🦁</span>
        התחל הישרדות
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="mt-12 text-[10px] text-text-muted/40 text-center max-w-xs leading-relaxed"
      >
        זהו משחק בדיוני. הישארו בטוחים ופעלו לפי הוראות פיקוד העורף.
      </motion.p>
    </div>
  )
}
