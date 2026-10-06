// Bonus: save & reopen work as a project file (everything stays on the user's computer).
import { parseTender } from './tender.js'

const FORMAT = 'tender-package-project'

function toBase64(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

function fromBase64(b64) {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

export function exportProject({ data, files, matches, expiry, expiryAuto, withIndex }) {
  return JSON.stringify({
    format: FORMAT,
    version: 1,
    savedAt: new Date().toISOString(),
    tender: data.tender,
    requirements: data.requirements,
    files: files.map(({ bytes, thumb, ...f }) => ({ ...f, bytes: bytes ? toBase64(bytes) : null })),
    matches,
    expiry,
    expiryAuto,
    withIndex,
  })
}

// Throws Error('badProject') if the file is not a project file.
export function importProject(text) {
  let p
  try {
    p = JSON.parse(text)
  } catch {
    throw new Error('badProject')
  }
  if (p?.format !== FORMAT || !p.tender || !Array.isArray(p.requirements) || !Array.isArray(p.files)) throw new Error('badProject')
  const isPdf = (b) => b && new TextDecoder('latin1').decode(b.subarray(0, 1024)).includes('%PDF-')
  const files = p.files.map((f) => {
    const bytes = typeof f.bytes === 'string' ? fromBase64(f.bytes) : undefined
    const error = f.error || (isPdf(bytes) ? undefined : 'notPdf')
    return {
      id: String(f.id),
      name: String(f.name ?? 'file.pdf'),
      size: Number(f.size) || bytes?.length || 0,
      pages: Number(f.pages) || 0,
      hash: String(f.hash ?? ''),
      text: typeof f.text === 'string' ? f.text : '',
      detectedExpiry: /^\d{4}-\d{2}-\d{2}$/.test(f.detectedExpiry) ? f.detectedExpiry : null,
      ...(error ? { error: String(error) } : { bytes }),
    }
  })
  const ids = new Set(files.filter((f) => !f.error).map((f) => f.id))
  const matches = Object.fromEntries(Object.entries(p.matches || {}).filter(([, id]) => ids.has(id)))
  let data
  try {
    data = parseTender(JSON.stringify({ tender: p.tender, requirements: p.requirements })) // same validation as requirements.json
  } catch {
    throw new Error('badProject')
  }
  return {
    data,
    files,
    matches,
    expiry: p.expiry || {},
    expiryAuto: p.expiryAuto || {},
    withIndex: p.withIndex !== false,
  }
}
