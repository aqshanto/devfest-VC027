import { useState } from 'react'
import { ListChecks, Timer } from 'lucide-react'
import { useT } from '../i18n.js'

export const DRAG_TYPE = 'application/x-tender-file'

export default function RequirementList({ requirements, renderRight, renderBelow, actions, onDropFile }) {
  const { t, num, lang } = useT()
  const [over, setOver] = useState(null)
  return (
    <section className="glass rise p-4 sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
        <ListChecks className="size-5 text-violet-500" />
        {t('requirements')}
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {num(requirements.length)}
        </span>
        <span className="ml-auto flex gap-2">{actions}</span>
      </h3>
      <ul className="space-y-2">
        {requirements.map((r) => (
          <li
            key={r.id}
            id={`req-${r.id}`}
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
              e.preventDefault()
              setOver(r.id)
            }}
            onDragLeave={() => setOver((o) => (o === r.id ? null : o))}
            onDrop={(e) => {
              const fileId = e.dataTransfer.getData(DRAG_TYPE)
              setOver(null)
              if (!fileId) return
              e.preventDefault()
              onDropFile?.(r.id, fileId)
            }}
            className={`rounded-xl border p-3 transition hover:shadow-md ${
              over === r.id
                ? 'scale-[1.01] border-violet-500 bg-violet-50 shadow-lg ring-2 ring-violet-400/50 dark:bg-violet-500/15'
                : 'border-slate-200/70 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/50'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                {num(r.order)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{lang === 'bn' ? r.title_bn : r.title_en}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-medium">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      r.mandatory
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r.mandatory ? t('mandatory') : t('optional')}
                  </span>
                  {r.has_expiry && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Timer className="size-3" />
                      {t('hasExpiry')}
                    </span>
                  )}
                </div>
              </div>
              {renderRight?.(r)}
            </div>
            {renderBelow?.(r)}
          </li>
        ))}
      </ul>
    </section>
  )
}
