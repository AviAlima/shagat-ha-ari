import { motion, AnimatePresence } from 'framer-motion'
import type { LucideProps } from 'lucide-react'
import {
  Siren,
  ShoppingCart,
  Heart,
  Zap,
  DoorOpen,
  Radio,
  Laptop,
  Droplets,
  Cat,
  Image,
} from 'lucide-react'

export interface MamadEventData {
  id: string
  title: string
  description: string
  icon: string
  urgent: boolean
  options: {
    label: string
    effects: { sanity?: number; morale?: number; supplies?: number; battery?: number }
  }[]
}

interface MamadEventProps {
  event: MamadEventData
  onChoice: (effects: { sanity?: number; morale?: number; supplies?: number; battery?: number }) => void
}

const ICON_MAP: Record<string, React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>> = {
  Siren,
  ShoppingCart,
  Heart,
  Zap,
  DoorOpen,
  Radio,
  Laptop,
  Droplets,
  Cat,
  Image,
}

export const MAMAD_EVENTS: MamadEventData[] = [
  {
    id: 'siren_stay_put',
    title: 'Siren -- Stay Put!',
    description: 'The familiar siren wails again, but you\'re already in the mamad. The walls vibrate.',
    icon: 'Siren',
    urgent: true,
    options: [
      { label: 'Calm the family', effects: { morale: 5, sanity: -5 } },
      { label: 'Put on music', effects: { morale: 3, sanity: 3, battery: -2 } },
    ],
  },
  {
    id: 'supply_run',
    title: 'Supply Run Needed',
    description: 'Supplies are running low. Someone needs to go to the corner store between sirens.',
    icon: 'ShoppingCart',
    urgent: false,
    options: [
      { label: 'Go yourself', effects: { sanity: -12, supplies: 12 } },
      { label: 'Send brother', effects: { morale: -8, supplies: 15 } },
      { label: 'Wait it out', effects: { morale: -5 } },
    ],
  },
  {
    id: 'mom_panic',
    title: "Mom's Having a Panic Attack",
    description: 'Mom is spiraling. Her breathing is fast and shallow. Someone needs to help.',
    icon: 'Heart',
    urgent: true,
    options: [
      { label: 'Make her tea', effects: { morale: 10, supplies: -3 } },
      { label: 'Talk her down', effects: { sanity: -8, morale: 12 } },
      { label: 'Give her phone', effects: { battery: -5, morale: 8 } },
    ],
  },
  {
    id: 'power_outage',
    title: 'Power Outage',
    description: 'Electricity cut. The mamad goes dark. Battery-powered devices only now.',
    icon: 'Zap',
    urgent: true,
    options: [
      { label: 'Light candles', effects: { morale: 5 } },
      { label: 'Use phone flashlight', effects: { battery: -15, morale: 3 } },
      { label: 'Sit in darkness', effects: { sanity: -10, morale: -5 } },
    ],
  },
  {
    id: 'neighbor_knocking',
    title: 'Neighbor Knocking',
    description: "There's a frantic knock. Your neighbor has no mamad. They're begging to come in.",
    icon: 'DoorOpen',
    urgent: false,
    options: [
      { label: 'Let them in', effects: { morale: 15, supplies: -10, sanity: -5 } },
      { label: 'Turn them away', effects: { morale: -15, sanity: 5 } },
    ],
  },
  {
    id: 'good_news',
    title: 'Good News on Radio',
    description: 'The radio crackles. Ceasefire rumors. Diplomatic progress. Could it be real?',
    icon: 'Radio',
    urgent: false,
    options: [
      { label: 'Celebrate!', effects: { sanity: 5, morale: 5 } },
      { label: "Don't get hopes up", effects: { sanity: 3 } },
    ],
  },
  {
    id: 'brother_zoom',
    title: "Brother's Zoom Call Drama",
    description: 'Your brother just got fired from his remote job. During a war. He looks crushed.',
    icon: 'Laptop',
    urgent: false,
    options: [
      { label: 'Console him', effects: { sanity: -5, morale: 10 } },
      { label: 'Tell him there are bigger problems', effects: { morale: -12 } },
    ],
  },
  {
    id: 'water_pressure',
    title: 'Water Pressure Drop',
    description: 'The tap sputters. Municipal water is becoming unreliable.',
    icon: 'Droplets',
    urgent: true,
    options: [
      { label: 'Fill containers now', effects: { supplies: 8 } },
      { label: 'Hope it comes back', effects: { supplies: -10 } },
    ],
  },
  {
    id: 'cat_escaped',
    title: 'Cat Escaped!',
    description: 'The cat slipped out during a supply run. You can hear it meowing outside.',
    icon: 'Cat',
    urgent: false,
    options: [
      { label: 'Go find it', effects: { sanity: -8, morale: 10 } },
      { label: "It'll come back", effects: { sanity: -3 } },
    ],
  },
  {
    id: 'photo_album',
    title: 'Family Photo Album',
    description: 'Someone found the old photo album under a pile of blankets. Memories from before.',
    icon: 'Image',
    urgent: false,
    options: [
      { label: 'Look through it together', effects: { sanity: 5, morale: 5 } },
      { label: 'Not now', effects: {} },
    ],
  },
]

function formatEffect(key: string, value: number): string {
  const icons: Record<string, string> = {
    sanity: '\u{1F9E0}',
    morale: '\u{2764}\u{FE0F}',
    supplies: '\u{1F4E6}',
    battery: '\u{1F50B}',
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value} ${icons[key] || key}`
}

export function MamadEvent({ event, onChoice }: MamadEventProps) {
  const IconComponent = ICON_MAP[event.icon]
  const borderColor = event.urgent ? 'border-alert-red/60' : 'border-neon-amber/60'
  const glowColor = event.urgent
    ? 'shadow-[0_0_30px_rgba(255,23,68,0.2)]'
    : 'shadow-[0_0_30px_rgba(255,171,0,0.15)]'
  const iconColor = event.urgent ? 'text-alert-red' : 'text-neon-amber'
  const iconBg = event.urgent ? 'bg-alert-red/10 border-alert-red/30' : 'bg-neon-amber/10 border-neon-amber/30'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-noir-bg/80 backdrop-blur-sm"
        />

        {/* Event card */}
        <motion.div
          initial={{ y: 100, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 100, scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-sm bg-noir-card border ${borderColor} ${glowColor} rounded-lg p-6 flex flex-col items-center gap-4`}
        >
          {/* Icon */}
          <div className={`p-3 rounded-full border ${iconBg}`}>
            {IconComponent && <IconComponent size={32} className={iconColor} />}
          </div>

          {/* Title */}
          <h2 className={`text-lg font-bold text-center ${event.urgent ? 'text-alert-red' : 'text-neon-amber'}`}>
            {event.title}
          </h2>

          {/* Description */}
          <p className="text-xs text-text-muted text-center leading-relaxed">
            {event.description}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3 w-full mt-2">
            {event.options.map((option, i) => {
              const effectEntries = Object.entries(option.effects).filter(
                ([, v]) => v !== undefined && v !== 0
              ) as [string, number][]

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChoice(option.effects)}
                  className="w-full px-4 py-3 bg-noir-surface border border-noir-border rounded cursor-pointer hover:border-neon-amber/40 hover:bg-noir-card transition-all text-left"
                >
                  <span className="text-sm text-text-primary font-bold block mb-1">
                    {option.label}
                  </span>
                  {effectEntries.length > 0 && (
                    <span className="text-[10px] text-text-muted flex flex-wrap gap-2">
                      {effectEntries.map(([key, val]) => (
                        <span
                          key={key}
                          className={val > 0 ? 'text-neon-green' : 'text-alert-red'}
                        >
                          {formatEffect(key, val)}
                        </span>
                      ))}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
