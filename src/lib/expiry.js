// Smart Read: find an expiry date in a PDF's text (suggestion only - the user confirms it).
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const KEYWORDS = /(valid\s*(until|till|up\s*to|upto|through|thru)|expir(y|es|ed|ation)(\s*date)?|validity|date\s*of\s*expiry|meyad|মেয়াদ)/gi

const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return `${y}-${pad(m)}-${pad(d)}`
}
const month = (s) => MONTHS.indexOf(s.slice(0, 3).toLowerCase()) + 1

const PATTERNS = [
  // 2027-06-30 / 2027/06/30 / 2027.06.30
  [/\b(20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})\b/, (m) => iso(+m[1], +m[2], +m[3])],
  // 30 June 2027 / 30th Jun, 2027
  [/\b(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})\.?,?[\s-]+(20\d\d)\b/, (m) => month(m[2]) && iso(+m[3], month(m[2]), +m[1])],
  // June 30, 2027
  [/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d\d)\b/, (m) => month(m[1]) && iso(+m[3], month(m[1]), +m[2])],
  // 30/06/2027 or 30-06-2027 (day first, as used in Bangladesh)
  [/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d\d)\b/, (m) => iso(+m[3], +m[2], +m[1])],
]

function firstDate(s) {
  let best = null
  for (const [re, conv] of PATTERNS) {
    const m = s.match(re)
    if (!m) continue
    const v = conv(m)
    if (v && (best === null || m.index < best.index)) best = { index: m.index, value: v }
  }
  return best?.value || null
}

export function detectExpiry(text) {
  if (!text) return null
  const s = text.replace(/\s+/g, ' ')
  for (const k of s.matchAll(KEYWORDS)) {
    const d = firstDate(s.slice(k.index, k.index + 90))
    if (d) return d
  }
  return null
}
