import { useT } from '../i18n.js'
import { BLOCKING } from '../lib/status.js'
import { STATUS_STYLE } from './StatusChip.jsx'

const ORDER = ['OK', 'MISSING', 'EXPIRED', 'EXPIRY_NEEDED', 'NOT_PROVIDED']

export default function SummaryBar({ statuses }) {
  const { t, num } = useT()
  const list = Object.values(statuses)
  const total = list.length
  const ready = list.filter((s) => !BLOCKING.has(s)).length
  const pct = total ? ready / total : 0
  const C = 2 * Math.PI * 22

  return (
    <section className="glass rise flex flex-wrap items-center gap-4 p-4">
      <div className="relative grid size-16 place-items-center">
        <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
          <circle cx="26" cy="26" r="22" fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-700" />
          <circle
            cx="26" cy="26" r="22" fill="none" strokeWidth="6" strokeLinecap="round"
            stroke="url(#ring)" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
            style={{ transition: 'stroke-dashoffset .5s ease' }}
          />
          <defs>
            <linearGradient id="ring" x1="0" x2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor={pct === 1 ? '#10b981' : '#d946ef'} />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-sm font-extrabold">{num(ready)}/{num(total)}</span>
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('ready')}</p>
      <div className="ml-auto flex flex-wrap gap-2">
        {ORDER.map((s) => {
          const n = list.filter((x) => x === s).length
          if (!n) return null
          const [cls, Icon] = STATUS_STYLE[s]
          return (
            <span key={s} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
              <Icon className="size-3.5" />
              {t('st_' + s)} · {num(n)}
            </span>
          )
        })}
      </div>
    </section>
  )
}
