import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import TopBar from './components/TopBar.jsx'
import Stepper from './components/Stepper.jsx'
import DropZone from './components/DropZone.jsx'
import TenderCard from './components/TenderCard.jsx'
import RequirementList from './components/RequirementList.jsx'
import { useToast } from './components/Toasts.jsx'
import { useT } from './i18n.js'
import { parseTender } from './lib/tender.js'

const SAMPLE = '/sample/'

export default function App() {
  const { t } = useT()
  const toast = useToast()
  const [data, setData] = useState(null) // { tender, requirements }

  const loadTenderText = (text) => {
    try {
      setData(parseTender(text))
      toast('success', t('tenderLoaded'))
      return true
    } catch (e) {
      toast('error', t(e.message))
      return false
    }
  }

  const loadJsonFile = async ([file]) => loadTenderText(await file.text())

  const loadSample = async () => {
    const res = await fetch(SAMPLE + 'requirements.json')
    loadTenderText(await res.text())
  }

  // ?sample=1 auto-loads the sample pack (used for screenshots)
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (new URLSearchParams(location.search).get('sample')) loadSample()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="blob -left-32 -top-32 size-96 bg-indigo-400" />
      <div className="blob -right-24 top-40 size-80 bg-fuchsia-400" />
      <div className="blob bottom-0 left-1/3 size-96 bg-violet-300" />

      <TopBar tenderId={data?.tender.tender_id} />

      <main className="relative mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Stepper done={[!!data, false, false, false]} />

        {!data ? (
          <section className="glass rise mx-auto max-w-2xl space-y-4 p-6">
            <DropZone accept=".json,application/json" onFiles={loadJsonFile} title={t('loadJson')} hint={t('dropJson')} />
            <div className="flex justify-center">
              <button className="btn-ghost" onClick={loadSample}>
                <Sparkles className="size-4 text-fuchsia-500" />
                {t('trySample')}
              </button>
            </div>
          </section>
        ) : (
          <>
            <TenderCard tender={data.tender} onChange={() => setData(null)} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RequirementList requirements={data.requirements} />
              </div>
              <aside className="glass rise grid place-items-center p-8 text-sm text-slate-400">{t('comingSoon')}</aside>
            </div>
          </>
        )}
      </main>

      <footer className="relative flex items-center justify-center gap-2 py-6 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-4 text-emerald-500" />
        {t('privacy')}
      </footer>
    </div>
  )
}
