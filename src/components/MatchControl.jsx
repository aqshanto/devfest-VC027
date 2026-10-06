import { AlertTriangle, CalendarDays, FileText, Undo2 } from 'lucide-react'
import { looksLikeOther } from '../lib/automatch.js'
import { useT } from '../i18n.js'
import { matchBlockReason } from '../lib/status.js'

export default function MatchControl({ req, requirements, files, matches, expiry, onMatch, onExpiry }) {
  const { t, lang } = useT()
  const fileId = matches[req.id] || ''
  const usable = files.filter((f) => !f.error)
  const file = files.find((f) => f.id === fileId)
  const other = file && looksLikeOther(req, file.name, requirements)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700/60">
      <label className="relative min-w-0 flex-1 basis-56">
        <FileText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <select
          value={fileId}
          onChange={(e) => onMatch(req.id, e.target.value || null)}
          className={`w-full cursor-pointer appearance-none truncate rounded-xl border py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-violet-500/50 ${
            fileId
              ? 'border-violet-300 bg-violet-50 font-medium dark:border-violet-500/40 dark:bg-violet-500/10'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
          }`}
          aria-label={t('chooseFile')}
        >
          <option value="">{t('chooseFile')}</option>
          {usable.map((f) => {
            const why = matchBlockReason(f.id, req.id, files, matches)
            return (
              <option key={f.id} value={f.id} disabled={!!why}>
                {f.name} · {f.pages === 1 ? t('page1') : t('pages', { n: f.pages })}
                {why ? ` — ${t(why)}` : ''}
              </option>
            )
          })}
        </select>
      </label>

      {fileId && req.has_expiry && (
        <label className="relative" title={t('expiryDate')}>
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-amber-500" />
          <input
            type="date"
            value={expiry[req.id] || ''}
            onChange={(e) => onExpiry(req.id, e.target.value)}
            className={`rounded-xl border py-2 pl-9 pr-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/50 dark:[color-scheme:dark] ${
              expiry[req.id] ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900' : 'border-amber-400 bg-amber-50 dark:bg-amber-500/10'
            }`}
            aria-label={t('expiryDate')}
          />
        </label>
      )}

      {fileId && (
        <button
          onClick={() => onMatch(req.id, null)}
          className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title={t('clear')}
          aria-label={t('clear')}
        >
          <Undo2 className="size-4" />
        </button>
      )}

      {other && (
        <p className="flex w-full items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="size-3.5 shrink-0" />
          {t('looksLike', { doc: lang === 'bn' ? other.title_bn : other.title_en })}
        </p>
      )}
    </div>
  )
}
