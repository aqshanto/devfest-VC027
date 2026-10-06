import { CalendarClock, Copy, FileText, FileX2, Files, Link2, Loader2, ScanSearch, Trash2 } from 'lucide-react'
import { guessReq } from '../lib/automatch.js'
import { DRAG_TYPE } from './RequirementList.jsx'
import { useT } from '../i18n.js'
import { formatSize } from '../lib/files.js'
import DropZone from './DropZone.jsx'

// usedBy: fileId → requirement label (filled in F3)
export default function FilePanel({ files, dupOf, busy, onAdd, onRemove, usedBy = {}, requirements = [], deadline }) {
  const { t, num, lang } = useT()
  const valid = files.filter((f) => !f.error).length

  return (
    <section className="glass rise flex flex-col gap-4 p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-base font-bold">
        <Files className="size-5 text-fuchsia-500" />
        {t('files')}
        <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
          {num(valid)}
        </span>
        {busy && (
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            {t('reading')}
          </span>
        )}
      </h3>

      <DropZone compact multiple accept=".pdf,application/pdf" onFiles={onAdd} title={t('dropPdf')} hint={t('pdfOnly')} />

      {files.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('noFiles')}</p>
      ) : (
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {files.map((f) => {
            const bad = !!f.error
            const dup = dupOf[f.id]
            const guess = !f.error && !usedBy[f.id] ? guessReq(f, requirements, deadline) : null
            return (
              <li
                key={f.id}
                draggable={!bad}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_TYPE, f.id)
                  e.dataTransfer.effectAllowed = 'link'
                }}
                title={bad ? undefined : t('dragHint')}
                className={`rise flex items-start gap-3 rounded-xl border p-3 text-sm ${bad ? '' : 'cursor-grab active:cursor-grabbing'} ${
                  bad
                    ? 'border-rose-200 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10'
                    : dup
                      ? 'border-violet-300 bg-violet-50/80 dark:border-violet-500/40 dark:bg-violet-500/10'
                      : 'border-slate-200/70 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/50'
                }`}
              >
                {f.thumb ? (
                  <img
                    src={f.thumb}
                    alt={f.name}
                    className="h-16 w-12 shrink-0 rounded-md border border-slate-200 bg-white object-cover object-top shadow-sm transition hover:scale-[2.5] hover:shadow-xl dark:border-slate-600"
                    style={{ transformOrigin: 'left center' }}
                  />
                ) : (
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                      bad ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                    }`}
                  >
                    {bad ? <FileX2 className="size-4" /> : <FileText className="size-4" />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold" title={f.name}>{f.name}</p>
                  {bad ? (
                    <p className="mt-0.5 text-xs font-medium text-rose-600 dark:text-rose-300">{t(f.error, { name: f.name })}</p>
                  ) : (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{f.pages === 1 ? t('page1') : t('pages', { n: f.pages })}</span>
                      <span>·</span>
                      <span>{formatSize(f.size)}</span>
                      {dup && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 font-semibold text-white" title={t('sameAs', { name: dup })}>
                          <Copy className="size-3" />
                          {t('duplicate')}
                        </span>
                      )}
                      {f.detectedExpiry && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                            deadline && f.detectedExpiry < deadline
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                          }`}
                          title={t('autoDateHint')}
                        >
                          <CalendarClock className="size-3" />
                          {num(f.detectedExpiry)}
                        </span>
                      )}
                      {guess && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" title={t('guessHint')}>
                          <ScanSearch className="size-3" />
                          {lang === 'bn' ? guess.title_bn : guess.title_en}
                        </span>
                      )}
                      {usedBy[f.id] && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Link2 className="size-3" />
                          {usedBy[f.id]}
                        </span>
                      )}
                    </div>
                  )}
                  {dup && <p className="mt-1 truncate text-[11px] text-violet-700 dark:text-violet-300">{t('sameAs', { name: dup })}</p>}
                </div>
                <button
                  onClick={() => onRemove(f.id)}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/15"
                  title={t('remove')}
                  aria-label={t('remove')}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
