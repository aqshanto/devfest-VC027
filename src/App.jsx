import { ShieldCheck } from 'lucide-react'
import TopBar from './components/TopBar.jsx'
import Stepper from './components/Stepper.jsx'
import { useT } from './i18n.js'

export default function App() {
  const { t } = useT()
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="blob -left-32 -top-32 size-96 bg-indigo-400" />
      <div className="blob -right-24 top-40 size-80 bg-fuchsia-400" />
      <div className="blob bottom-0 left-1/3 size-96 bg-violet-300" />

      <TopBar />

      <main className="relative mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Stepper done={[false, false, false, false]} />
        <section className="glass rise grid place-items-center p-12 text-center text-slate-400">
          {t('comingSoon')}
        </section>
      </main>

      <footer className="relative flex items-center justify-center gap-2 py-6 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-4 text-emerald-500" />
        {t('privacy')}
      </footer>
    </div>
  )
}
