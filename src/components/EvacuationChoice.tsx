import { motion } from 'framer-motion'
import { Home, Car } from 'lucide-react'

interface EvacuationChoiceProps {
  onStay: () => void
  onDrive: () => void
}

export function EvacuationChoice({ onStay, onDrive }: EvacuationChoiceProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-alert-red/10 rounded-full blur-3xl" />

      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-2xl font-bold text-alert-red mb-2 text-center"
      >
        The Sirens Won't Stop
      </motion.h1>

      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-text-muted mb-10 text-center max-w-xs"
      >
        Three rounds survived. The situation is escalating. What do you do?
      </motion.p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        {/* Stay Option */}
        <motion.button
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStay}
          className="flex-1 flex flex-col items-center gap-3 p-6 rounded-lg border border-neon-amber/30 bg-noir-card/60 cursor-pointer hover:border-neon-amber/60 hover:shadow-[0_0_20px_rgba(255,171,0,0.15)] transition-all"
        >
          <div className="p-3 rounded-full bg-neon-amber/10 border border-neon-amber/20">
            <Home size={32} className="text-neon-amber" />
          </div>
          <span className="text-sm font-bold text-neon-amber uppercase tracking-wider">Stay in Tel Aviv</span>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] text-neon-green">+ Familiar shelter nearby</span>
            <span className="text-[10px] text-neon-green">+ Your apartment, your stuff</span>
            <span className="text-[10px] text-alert-red">- Supply shortages worsening</span>
            <span className="text-[10px] text-alert-red">- Sirens getting more frequent</span>
          </div>
        </motion.button>

        {/* Drive Option */}
        <motion.button
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDrive}
          className="flex-1 flex flex-col items-center gap-3 p-6 rounded-lg border border-alert-red/30 bg-noir-card/60 cursor-pointer hover:border-alert-red/60 hover:shadow-[0_0_20px_rgba(255,23,68,0.15)] transition-all"
        >
          <div className="p-3 rounded-full bg-alert-red/10 border border-alert-red/20">
            <Car size={32} className="text-alert-red" />
          </div>
          <span className="text-sm font-bold text-alert-red uppercase tracking-wider">Drive to Parents</span>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] text-neon-green">+ Family waiting for you</span>
            <span className="text-[10px] text-neon-green">+ Mamad (safe room) at home</span>
            <span className="text-[10px] text-alert-red">- 60km on dangerous roads</span>
            <span className="text-[10px] text-alert-red">- Sirens can catch you mid-drive</span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
