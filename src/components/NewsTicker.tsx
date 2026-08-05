import { Radio } from 'lucide-react'

interface TickerMessage {
  sender: string
  text: string
  type: 'chat' | 'alert'
}

const messages: TickerMessage[] = [
  // WhatsApp group messages
  { sender: 'Omer', text: 'מישהו יודע אם המשרד פתוח מחר? אני לא מסוגל לעבוד מהבית יותר.', type: 'chat' },
  { sender: 'Noa', text: 'שוב יירוטים מעל המרכז... מישהו ראה את הנפילה?', type: 'chat' },
  { sender: 'Mom', text: 'תעדכן שהגעת למקלט ושלקחת מים!', type: 'chat' },
  { sender: 'Amit', text: 'חצי שעה בתור לסופר ונגמרו הביצים. המצור במיצרים הזה הורג אותי.', type: 'chat' },
  { sender: 'Yael', text: 'מישהו צריך שמירה על ילדים? אני פנויה מחר.', type: 'chat' },
  { sender: 'Dad', text: 'בואו הביתה. יש מספיק אוכל ומקום במקלט.', type: 'chat' },
  { sender: 'Omer', text: 'הבוס שלי שלח הודעה שעובדים מרחוק עד הודעה חדשה 🙏', type: 'chat' },
  { sender: 'Noa', text: 'נגמר החלב... מי הולך לסופר?', type: 'chat' },
  // News alerts
  { sender: 'News', text: 'IDF strikes Tehran missile sites — multiple explosions reported', type: 'alert' },
  { sender: 'News', text: 'GPS jamming reported across Gush Dan — navigation apps unreliable', type: 'alert' },
  { sender: 'News', text: 'Hormuz Strait blockade: Milk +15% | Eggs +15% | Fuel rationing expected', type: 'alert' },
  { sender: 'News', text: 'Home Front Command: 60 seconds to reach shelter in central district', type: 'alert' },
  { sender: 'פיקוד העורף', text: 'דיווחים על פגיעה ישירה בטהרן. צפו לתגובה בדקות הקרובות.', type: 'alert' },
  { sender: 'News', text: 'Iron Dome interceptions over Haifa Bay — stay in sheltered areas', type: 'alert' },
  { sender: 'Mom', text: 'ראית את החדשות?! בואו הביתה עכשיו!', type: 'chat' },
  { sender: 'Amit', text: 'גנרטור של השכן נגמר לו סולר. מי יכול לעזור?', type: 'chat' },
]

function MessageBubble({ message }: { message: TickerMessage }) {
  if (message.sender === 'פיקוד העורף') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-amber/15 border border-neon-amber/40 text-neon-amber text-xs whitespace-nowrap">
        <span className="font-bold">פיקוד העורף</span>
        <span className="opacity-40">·</span>
        <span>{message.text}</span>
      </span>
    )
  }

  if (message.type === 'alert') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-alert-red/15 border border-alert-red/40 text-alert-red text-xs whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse shrink-0" />
        <span className="font-bold tracking-wider">BREAKING</span>
        <span className="opacity-40">·</span>
        <span>{message.text}</span>
      </span>
    )
  }

  // WhatsApp-style chat bubble
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-noir-card/70 border border-noir-border/60 text-xs whitespace-nowrap">
      <span className="font-bold text-[#25D366]">{message.sender}</span>
      <span className="text-text-muted/40">·</span>
      <span className="text-text-primary/90">{message.text}</span>
    </span>
  )
}

export function NewsTicker() {
  const doubled = [...messages, ...messages]

  return (
    <div className="relative w-full bg-noir-surface/60 border-b border-noir-border/60 backdrop-blur-md overflow-hidden">
      <div className="flex items-center h-9">
        {/* Live badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-alert-red px-3 h-full z-10 shadow-[0_0_20px_rgba(255,23,68,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
          <span className="text-[11px] font-bold tracking-wider text-white">LIVE</span>
        </div>

        {/* Date badge */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 h-full text-neon-amber bg-noir-surface/80 z-10 border-r border-noir-border/60">
          <Radio size={12} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider">MAR 18, 2026</span>
        </div>

        {/* Scrolling messages */}
        <div className="overflow-hidden flex-1 relative h-full flex items-center">
          <div className="animate-ticker whitespace-nowrap flex gap-3 items-center pl-3">
            {doubled.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}
          </div>
          {/* Edge fade */}
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-noir-bg/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
