// Suggest file → document matches from file names (bonus: auto-match).
const GENERIC = new Set(['certificate', 'cert', 'statement', 'letter', 'document', 'doc', 'copy', 'scan', 'final', 'signed'])
const STOP = new Set(['of', 'the', 'and', 'for', 'a', 'an', 'to', 'in', 'pdf', 's'])
const SYNONYMS = {
  trade: ['tl', 'licence', 'license'],
  license: ['licence', 'tl'],
  tin: ['tax', 'etin'],
  vat: ['bin', 'mushak'],
  registration: ['reg'],
  solvency: ['bank', 'solv'],
  bank: ['solvency'],
  experience: ['exp', 'work'],
  audited: ['audit', 'audited'],
  financial: ['fin', 'price', 'priced', 'boq'],
  technical: ['tech'],
  proposal: ['offer', 'bid'],
  manufacturer: ['mfr', 'maf', 'oem'],
  authorization: ['auth', 'authorisation', 'maf'],
  declaration: ['decl', 'declare', 'undertaking'],
}

const words = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\.pdf$/, '')
    .replace(/([a-z])(\d)|(\d)([a-z])/g, '$1$3 $2$4')
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w))

const near = (a, b) => a === b || (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a)))

export function scoreName(req, fileName) {
  const fw = words(fileName)
  let score = 0
  for (const k of words(req.title_en)) {
    const options = [k, ...(SYNONYMS[k] || [])]
    if (fw.some((w) => options.some((o) => near(w, o)))) score += GENERIC.has(k) ? 0.2 : 1
  }
  // tie-break: newer year in the name wins (e.g. *_2026 over *_2025)
  const year = Math.max(0, ...fw.filter((w) => /^20\d\d$/.test(w)).map(Number))
  // newer year wins, then the shorter (original, not "copy (1)") name
  return score + year / 1e6 - fileName.length / 1e9
}

const norm = (s) => ` ${words(s).join(' ')} `

// Smart Read: score from the PDF text. A title near the top (heading) counts most.
export function scoreText(req, text) {
  if (!text) return 0
  const all = norm(text)
  const head = norm(text.slice(0, 700))
  const phrase = norm(req.title_en)
  if (phrase.trim().length < 3) return 0
  if (head.includes(phrase)) return 3
  let score = all.includes(phrase) ? 1 : 0
  const keys = words(req.title_en).filter((k) => !GENERIC.has(k))
  const hits = keys.filter((k) => [k, ...(SYNONYMS[k] || [])].some((o) => head.includes(` ${o} `)))
  if (keys.length && hits.length === keys.length) score += 1.5
  return score
}

// Total score of a file for a document: file name + text, and for documents with
// an expiry date prefer a file whose detected date is still valid.
export function scoreFile(req, file, deadline) {
  let s = scoreName(req, file.name) + scoreText(req, file.text)
  if (req.has_expiry && file.detectedExpiry && deadline && s >= 0.9) s += file.detectedExpiry >= deadline ? 0.5 : -0.5
  return s
}

// Best-guess document for a file (shown in the file list).
export function guessReq(file, requirements, deadline) {
  let best = null
  let bestScore = 0.9
  for (const r of requirements) {
    const s = scoreFile(r, file, deadline)
    if (s > bestScore) [best, bestScore] = [r, s]
  }
  return best
}

// Returns a new matches object; existing matches are kept, only empty documents are filled.
export function autoMatch(requirements, files, matches, deadline) {
  const usable = files.filter((f) => !f.error)
  const takenFiles = new Set(Object.values(matches).filter(Boolean))
  const takenHashes = new Set(usable.filter((f) => takenFiles.has(f.id)).map((f) => f.hash))
  const pairs = []
  for (const r of requirements) {
    if (matches[r.id]) continue
    for (const f of usable) {
      const s = scoreFile(r, f, deadline)
      if (s >= 0.9) pairs.push([s, r.id, f])
    }
  }
  pairs.sort((a, b) => b[0] - a[0])
  const out = { ...matches }
  for (const [, rid, f] of pairs) {
    if (out[rid] || takenFiles.has(f.id) || takenHashes.has(f.hash)) continue
    out[rid] = f.id
    takenFiles.add(f.id)
    takenHashes.add(f.hash)
  }
  return out
}

// Soft check (does not change the Section 5 status): if the file name/text clearly points
// to a different document than the one it is matched to, return that document.
export function looksLikeOther(req, file, requirements) {
  const score = (r) => scoreName(r, file.name) + scoreText(r, file.text)
  const own = score(req)
  let best = null
  let bestScore = 0.9
  for (const r of requirements) {
    if (r.id === req.id) continue
    const s = score(r)
    if (s > bestScore) [best, bestScore] = [r, s]
  }
  return best && Math.floor(bestScore) > Math.floor(own) ? best : null
}
