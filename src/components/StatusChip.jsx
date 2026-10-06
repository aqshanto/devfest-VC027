import { CheckCircle2, CircleDashed, CircleX, CalendarX2, CalendarClock } from 'lucide-react'
import { useT } from '../i18n.js'

export const STATUS_STYLE = {
  OK: ['bg-emerald-500 text-white shadow-emerald-500/30', CheckCircle2],
  MISSING: ['bg-rose-500 text-white shadow-rose-500/30', CircleX],
  EXPIRED: ['bg-red-600 text-white shadow-red-600/30', CalendarX2],
  EXPIRY_NEEDED: ['bg-amber-400 text-amber-950 shadow-amber-400/30', CalendarClock],
  NOT_PROVIDED: ['bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 shadow-transparent', CircleDashed],
}

export default function StatusChip({ status }) {
  const { t } = useT()
  const [cls, Icon] = STATUS_STYLE[status]
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md transition ${cls}`}>
      <Icon className="size-3.5" />
      {t('st_' + status)}
    </span>
  )
}
