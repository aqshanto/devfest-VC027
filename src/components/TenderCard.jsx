import { Building2, CalendarClock, Hash, RefreshCw, Briefcase, FileText } from 'lucide-react'
import { useT } from '../i18n.js'
import { daysUntil } from '../lib/tender.js'

export default function TenderCard({ tender, onChange }) {
  const { t, num } = useT()
  const left = daysUntil(tender.submission_deadline)
  const chip =
    left > 0 ? [t('daysLeft', { n: left }), 'bg-emerald-400/20 text-emerald-50']
    : left === 0 ? [t('dueToday'), 'bg-amber-400/30 text-amber-50']
    : [t('overdue'), 'bg-rose-500/40 text-rose-50']

  const items = [
    [Hash, t('tenderId'), tender.tender_id, 'font-mono'],
    [Building2, t('entity'), tender.procuring_entity],
    [Briefcase, t('bidder'), tender.bidder],
    [CalendarClock, t('deadline'), num(tender.submission_deadline), 'font-mono'],
  ]

  return (
    <section className="rise relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-2xl shadow-violet-600/30 sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-white/70">{t('title')}</p>
          <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">{tender.title || tender.tender_id}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/20 ${chip[1]}`}>{chip[0]}</span>
        <button onClick={onChange} className="btn bg-white/15 px-3 text-white ring-1 ring-white/25 hover:bg-white/25" title={t('changeTender')}>
          <RefreshCw className="size-4" />
          <span className="hidden sm:inline">{t('changeTender')}</span>
        </button>
      </div>
      <dl className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([Icon, label, value, cls]) => (
          <div key={label} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
            <dt className="flex items-center gap-1.5 text-xs text-white/70"><Icon className="size-3.5" />{label}</dt>
            <dd className={`mt-1 truncate text-sm font-semibold ${cls || ''}`} title={value}>{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
