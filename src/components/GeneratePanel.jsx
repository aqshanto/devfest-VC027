import { AlertCircle, CheckCircle2, Download, Loader2, PackageCheck, Wand2 } from 'lucide-react'
import { useT } from '../i18n.js'

export default function GeneratePanel({ blocked, statuses, busy, result, fileName, onGenerate, onDownload }) {
  const { t, lang, num } = useT()
  const ready = blocked.length === 0

  return (
    <section className="glass rise space-y-3 p-4 sm:p-5">
      <button className="btn-primary w-full py-3 text-base" disabled={!ready || busy} onClick={onGenerate}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Wand2 className="size-5" />}
        {busy ? t('generating') : t('generate')}
      </button>

      {!ready ? (
        <div className="rounded-xl bg-rose-50 p-3 text-sm dark:bg-rose-500/10">
          <p className="mb-2 flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
            <AlertCircle className="size-4" />
            {t('blockedBy')}
          </p>
          <ul className="space-y-1">
            {blocked.map((r) => (
              <li key={r.id}>
                <button
                  className="w-full cursor-pointer rounded-lg px-2 py-1 text-left text-rose-800 transition hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-500/15"
                  onClick={() => document.getElementById(`req-${r.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <span className="font-semibold">{num(r.order)}. {lang === 'bn' ? r.title_bn : r.title_en}</span>
                  <span className="opacity-75"> — {t('st_' + statuses[r.id])}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : result ? (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-500/10">
          <PackageCheck className="size-8 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">{t('generated', { n: result.totalPages })}</p>
            <p className="truncate font-mono text-xs text-emerald-700/80 dark:text-emerald-300/80">{fileName}</p>
          </div>
          <button className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={onDownload}>
            <Download className="size-4" />
            {t('download')}
          </button>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          {t('allGood')}
        </p>
      )}
    </section>
  )
}
