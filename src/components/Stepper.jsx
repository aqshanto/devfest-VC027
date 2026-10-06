import { Check, FileJson, FileStack, Link2, Download } from 'lucide-react'
import { useT } from '../i18n.js'

const STEPS = [
  { key: 'step1', hint: 'step1Hint', Icon: FileJson },
  { key: 'step2', hint: 'step2Hint', Icon: FileStack },
  { key: 'step3', hint: 'step3Hint', Icon: Link2 },
  { key: 'step4', hint: 'step4Hint', Icon: Download },
]

// done: array of booleans per step; active = first not-done step
export default function Stepper({ done = [] }) {
  const { t, num } = useT()
  const active = done.findIndex((d) => !d)
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STEPS.map(({ key, hint, Icon }, i) => {
        const isDone = done[i]
        const isActive = i === active
        return (
          <li
            key={key}
            className={`glass flex items-center gap-3 p-3 transition ${isActive ? 'ring-2 ring-violet-500/60' : ''}`}
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : isActive
                    ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{num(i + 1)}</p>
              <p className="truncate text-sm font-semibold">{t(key)}</p>
              <p className="hidden truncate text-xs text-slate-500 lg:block dark:text-slate-400">{t(hint)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
