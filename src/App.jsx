import { useEffect, useMemo, useRef, useState } from 'react'
import { ShieldCheck, Sparkles, Undo2, WandSparkles } from 'lucide-react'
import { autoMatch } from './lib/automatch.js'
import TopBar from './components/TopBar.jsx'
import Stepper from './components/Stepper.jsx'
import DropZone from './components/DropZone.jsx'
import TenderCard from './components/TenderCard.jsx'
import RequirementList from './components/RequirementList.jsx'
import FilePanel from './components/FilePanel.jsx'
import MatchControl from './components/MatchControl.jsx'
import StatusChip from './components/StatusChip.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import { BLOCKING, getAllStatuses } from './lib/status.js'
import GeneratePanel from './components/GeneratePanel.jsx'
import { buildPackage, downloadBytes } from './lib/package.js'
import { useToast } from './components/Toasts.jsx'
import { useT } from './i18n.js'
import { parseTender, todayISO } from './lib/tender.js'
import { MAX_BYTES, MAX_FILES, findDuplicates, readFile } from './lib/files.js'

const SAMPLE = '/sample/'
const BASE_DEMO = {
  R02: ['03_tin_certificate.pdf'],
  R03: ['04_vat_certificate.pdf'],
  R05: ['experience_cert.pdf'],
  R08: ['02_technical_proposal.pdf'],
  R09: ['01_financial_proposal.pdf'],
  R10: ['scan_0042.pdf'],
}
const DEMOS = {
  problems: { ...BASE_DEMO, R01: ['trade_license_2025.pdf', '2025-06-30'], R04: ['bank_solvency.pdf'], R10: undefined },
  ready: { ...BASE_DEMO, R01: ['trade_license_2026.pdf', '2027-06-30'], R04: ['bank_solvency.pdf', '2026-12-31'] },
}
DEMOS.problems = Object.fromEntries(Object.entries(DEMOS.problems).filter(([, v]) => v))

export default function App() {
  const { t, lang, num } = useT()
  const toast = useToast()
  const [data, setData] = useState(null) // { tender, requirements }
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const dupOf = useMemo(() => findDuplicates(files), [files])
  const [matches, setMatches] = useState({}) // reqId → fileId
  const [expiry, setExpiry] = useState({}) // reqId → YYYY-MM-DD

  const statuses = useMemo(
    () => (data ? getAllStatuses(data.requirements, matches, expiry, data.tender.submission_deadline) : {}),
    [data, matches, expiry],
  )
  const blocked = data ? data.requirements.filter((r) => BLOCKING.has(statuses[r.id])) : []

  const usedBy = useMemo(() => {
    const out = {}
    for (const r of data?.requirements || []) {
      if (matches[r.id]) out[matches[r.id]] = `${num(r.order)}. ${lang === 'bn' ? r.title_bn : r.title_en}`
    }
    return out
  }, [data, matches, lang, num])

  const setMatch = (reqId, fileId) => {
    setMatches((m) => ({ ...m, [reqId]: fileId }))
    setExpiry((e) => ({ ...e, [reqId]: '' })) // expiry belongs to the chosen file
  }
  // Bonus: auto-match by file name (only fills empty documents; can be undone)
  const [undoMatches, setUndoMatches] = useState(null)
  const runAutoMatch = () => {
    const next = autoMatch(data.requirements, files, matches)
    const changed = Object.keys(next).filter((k) => next[k] !== matches[k])
    setUndoMatches({ matches, expiry })
    setMatches(next)
    setExpiry((e) => ({ ...e, ...Object.fromEntries(changed.map((k) => [k, ''])) }))
    toast(changed.length ? 'success' : 'info', t('autoMatched', { n: changed.length }))
  }
  const undoAutoMatch = () => {
    setMatches(undoMatches.matches)
    setExpiry(undoMatches.expiry)
    setUndoMatches(null)
  }

  const setExpiryFor = (reqId, date) => setExpiry((e) => ({ ...e, [reqId]: date }))

  // Generate (task 4.7 / 4.8)
  const [result, setResult] = useState(null) // { bytes, totalPages }
  const [generating, setGenerating] = useState(false)
  useEffect(() => setResult(null), [data, files, matches, expiry])
  const packageName = data ? `${data.tender.tender_id}_Package.pdf` : ''

  const generate = async () => {
    if (blocked.length) return
    setGenerating(true)
    try {
      const res = await buildPackage({ ...data, matches, files, generatedOn: todayISO() })
      setResult(res)
      downloadBytes(res.bytes, packageName)
      toast('success', t('generated', { n: res.totalPages }))
    } catch (e) {
      console.error(e)
      toast('error', t('genError'))
    } finally {
      setGenerating(false)
    }
  }

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
    return added
  }

  const removeFile = (id) => {
    setFiles((xs) => xs.filter((f) => f.id !== id))
    for (const [rid, fid] of Object.entries(matches)) if (fid === id) setMatch(rid, null)
  }

  const resetTender = () => {
    setData(null)
    setMatches({})
    setExpiry({})
    setUndoMatches(null)
  }

  const loadTenderText = (text) => {
    try {
      setData(parseTender(text))
      setMatches({})
      setExpiry({})
      setUndoMatches(null)
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
        const buf = await (await fetch(SAMPLE + 'documents/' + encodeURIComponent(n))).arrayBuffer()
        return new File([buf], n, { type: n.endsWith('.pdf') ? 'application/pdf' : 'image/png' })
      }),
    )
    setFiles([])
    const added = await addFiles(list)
    // ?demo=problems | ready pre-fills matches (used for README screenshots)
    const demo = DEMOS[new URLSearchParams(location.search).get('demo')]
    if (demo) {
      const m = {}
      const e = {}
      for (const [rid, [name, date]] of Object.entries(demo)) {
        m[rid] = added.find((f) => f.name === name && !f.error)?.id
        if (date) e[rid] = date
      }
      setMatches(m)
      setExpiry(e)
    }
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
        <Stepper done={[!!data, files.some((f) => !f.error), !!data && blocked.length === 0, !!result]} />

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
            <TenderCard tender={data.tender} onChange={resetTender} />
            <SummaryBar statuses={statuses} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RequirementList
                  requirements={data.requirements}
                  actions={
                    <>
                      {undoMatches && (
                        <button className="btn-ghost px-3 py-1.5 text-xs" onClick={undoAutoMatch} title={t('undo')}>
                          <Undo2 className="size-4" />
                          <span className="hidden sm:inline">{t('undo')}</span>
                        </button>
                      )}
                      <button
                        className="btn-primary px-3 py-1.5 text-xs"
                        onClick={runAutoMatch}
                        disabled={!files.some((f) => !f.error)}
                        title={t('autoMatchHint')}
                      >
                        <WandSparkles className="size-4" />
                        {t('autoMatch')}
                      </button>
                    </>
                  }
                  renderRight={(r) => <StatusChip status={statuses[r.id]} />}
                  renderBelow={(r) => (
                    <MatchControl req={r} files={files} matches={matches} expiry={expiry} onMatch={setMatch} onExpiry={setExpiryFor} />
                  )}
                />
              </div>
              <aside className="space-y-6">
                <GeneratePanel
                  blocked={blocked}
                  statuses={statuses}
                  busy={generating}
                  result={result}
                  fileName={packageName}
                  onGenerate={generate}
                  onDownload={() => downloadBytes(result.bytes, packageName)}
                />
                <FilePanel files={files} dupOf={dupOf} busy={busy} onAdd={addFiles} onRemove={removeFile} usedBy={usedBy} />
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
