import { Languages, Moon, PackageCheck, Sun } from 'lucide-react'
import { useT } from '../i18n.js'

export default function TopBar({ tenderId }) {
  const { t, lang, setLang, theme, setTheme } = useT()
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
          <PackageCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">{t('appName')}</h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{t('tagline')}</p>
        </div>
        {tenderId && (
          <span className="ml-2 hidden rounded-full bg-indigo-100 px-3 py-1 font-mono text-xs font-semibold text-indigo-700 md:inline dark:bg-indigo-500/15 dark:text-indigo-300">
            {tenderId}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn-ghost px-3"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            title={t('langLabel')}
            aria-label={t('langLabel')}
          >
            <Languages className="size-4" />
            <span>{t('langToggle')}</span>
          </button>
          <button
            className="btn-ghost px-3"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={t('themeLabel')}
            aria-label={t('themeLabel')}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
