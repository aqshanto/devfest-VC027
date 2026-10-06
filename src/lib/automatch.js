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

// Returns a new matches object; existing matches are kept, only empty documents are filled.
export function autoMatch(requirements, files, matches) {
  const usable = files.filter((f) => !f.error)
  const takenFiles = new Set(Object.values(matches).filter(Boolean))
  const takenHashes = new Set(usable.filter((f) => takenFiles.has(f.id)).map((f) => f.hash))
  const pairs = []
  for (const r of requirements) {
    if (matches[r.id]) continue
    for (const f of usable) {
      const s = scoreName(r, f.name)
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
