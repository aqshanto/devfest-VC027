import { useEffect, useMemo, useRef, useState } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import TopBar from './components/TopBar.jsx'
import Stepper from './components/Stepper.jsx'
import DropZone from './components/DropZone.jsx'
import TenderCard from './components/TenderCard.jsx'
import RequirementList from './components/RequirementList.jsx'
import FilePanel from './components/FilePanel.jsx'
import { useToast } from './components/Toasts.jsx'
import { useT } from './i18n.js'
import { parseTender } from './lib/tender.js'
import { MAX_BYTES, MAX_FILES, findDuplicates, readFile } from './lib/files.js'

const SAMPLE = '/sample/'

export default function App() {
  const { t } = useT()
  const toast = useToast()
  const [data, setData] = useState(null) // { tender, requirements }
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const dupOf = useMemo(() => findDuplicates(files), [files])

  const addFiles = async (list) => {
    setBusy(true)
    const valid = files.filter((f) => !f.error)
    let count = valid.length
    let bytes = valid.reduce((s, f) => s + f.size, 0)
    let overCount = false
    let overSize = false
    const added = []
    for (const file of list) {
      const r = await readFile(file)
      if (!r.error) {
        if (count + 1 > MAX_FILES) { overCount = true; continue }
        if (bytes + r.size > MAX_BYTES) { overSize = true; continue }
        count++
        bytes += r.size
      } else toast('error', t(r.error, { name: r.name }))
      added.push(r)
    }
    setFiles((xs) => [...xs, ...added])
    setBusy(false)
    if (overCount) toast('error', t('tooMany'))
    if (overSize) toast('error', t('tooBig'))
    const ok = added.filter((f) => !f.error).length
    if (ok) toast('success', t('filesAdded', { n: ok }))
  }

  const removeFile = (id) => setFiles((xs) => xs.filter((f) => f.id !== id))

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
    if (!loadTenderText(await res.text())) return
    const names = await (await fetch(SAMPLE + 'manifest.json')).json()
    const list = await Promise.all(
      names.map(async (n) => {
        const blob = await (await fetch(SAMPLE + 'documents/' + encodeURIComponent(n))).blob()
        return new File([blob], n, { type: n.endsWith('.pdf') ? 'application/pdf' : 'image/png' })
      }),
    )
    setFiles([])
    await addFiles(list)
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
        <Stepper done={[!!data, files.some((f) => !f.error), false, false]} />

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
              <aside className="lg:sticky lg:top-20 lg:self-start">
                <FilePanel files={files} dupOf={dupOf} busy={busy} onAdd={addFiles} onRemove={removeFile} />
              </aside>
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
