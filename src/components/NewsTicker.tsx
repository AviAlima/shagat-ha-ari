import { AlertTriangle, Radio } from 'lucide-react'

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-amber/80 text-white text-sm whitespace-nowrap">
        <span>⚠️</span>
        <span className="font-bold">{message.sender}</span>
        <span className="mx-0.5">·</span>
        <span>{message.text}</span>
      </span>
    )
  }

  if (message.type === 'alert') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alert-red/90 text-white text-sm whitespace-nowrap">
        <span>🔴</span>
        <span className="font-bold">BREAKING</span>
        <span className="mx-0.5">·</span>
        <span>{message.text}</span>
      </span>
    )
  }

  // WhatsApp-style chat bubble
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-noir-card/80 border border-noir-border/60 text-sm whitespace-nowrap">
      <span className="font-bold text-[#25D366]">{message.sender}</span>
      <span className="text-text-muted/40">·</span>
      <span className="text-text-primary/90">{message.text}</span>
    </span>
  )
}

export function NewsTicker() {
  const doubled = [...messages, ...messages]

  return (
    <div className="relative w-full bg-noir-surface border-b border-alert-red/30 overflow-hidden">
      <div className="flex items-center">
        {/* Live badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-alert-red px-3 py-2 z-10">
          <Radio size={14} className="animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-white">LIVE</span>
        </div>

        {/* Alert icon */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 text-neon-amber z-10 bg-noir-surface">
          <AlertTriangle size={14} />
          <span className="text-xs font-bold">Mar 18, 2026</span>
        </div>

        {/* Scrolling messages */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap flex gap-4 py-1.5 items-center">
            {doubled.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
