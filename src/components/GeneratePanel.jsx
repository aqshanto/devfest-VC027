import { AlertCircle, CheckCircle2, Download, Eye, ListOrdered, Loader2, PackageCheck, PackagePlus, Stamp, X } from 'lucide-react'
import { useT } from '../i18n.js'

export default function GeneratePanel({ blocked, statuses, busy, result, fileName, onGenerate, onDownload, onPreview, withIndex, onWithIndex, seal, sealMode, onSeal, onSealMode, onSealRemove }) {
  const { t, lang, num } = useT()
  const ready = blocked.length === 0

  return (
    <section className="glass rise space-y-3 p-4 sm:p-5">
      <button className="btn-primary w-full py-3 text-base" disabled={!ready || busy} onClick={onGenerate}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <PackagePlus className="size-5" />}
        {busy ? t('generating') : t('generate')}
      </button>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl px-1 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={withIndex}
          onChange={(e) => onWithIndex(e.target.checked)}
          className="size-4 cursor-pointer accent-violet-600"
        />
        <ListOrdered className="size-4 text-violet-500" />
        {t('withIndex')}
      </label>

      <div className="flex flex-wrap items-center gap-2 rounded-xl px-1 text-sm text-slate-600 dark:text-slate-300">
        <Stamp className="size-4 text-fuchsia-500" />
        <span>{t('seal')}</span>
        {seal ? (
          <>
            <img src={seal.url} alt={seal.name} className="h-8 w-8 rounded border border-slate-200 bg-white object-contain dark:border-slate-600" />
            <select
              value={sealMode}
              onChange={(e) => onSealMode(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
              aria-label={t('sealPages')}
            >
              <option value="last">{t('sealLast')}</option>
              <option value="all">{t('sealAll')}</option>
              <option value="none">{t('sealNone')}</option>
            </select>
            <button onClick={onSealRemove} className="cursor-pointer rounded p-1 text-slate-400 hover:text-rose-600" title={t('remove')} aria-label={t('remove')}>
              <X className="size-4" />
            </button>
          </>
        ) : (
          <label className="btn-ghost cursor-pointer px-2.5 py-1 text-xs">
            {t('sealUpload')}
            <input type="file" accept="image/png" hidden onChange={(e) => { e.target.files[0] && onSeal([e.target.files[0]]); e.target.value = '' }} />
          </label>
        )}
      </div>

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
        <div className="rise space-y-3 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <PackageCheck className="size-8 shrink-0 text-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">{t('generated', { n: result.totalPages })}</p>
              <p className="truncate font-mono text-xs text-emerald-700/80 dark:text-emerald-300/80">{fileName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn bg-white text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100 dark:bg-slate-900 dark:text-emerald-300 dark:ring-emerald-500/40" onClick={onPreview}>
              <Eye className="size-4" />
              {t('preview')}
            </button>
            <button className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={onDownload}>
              <Download className="size-4" />
              {t('download')}
            </button>
          </div>
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
