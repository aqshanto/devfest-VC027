// Bonus: save & reopen work as a project file (everything stays on the user's computer).
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
  const files = p.files.map((f) => ({ ...f, bytes: f.bytes ? fromBase64(f.bytes) : undefined }))
  const ids = new Set(files.filter((f) => !f.error).map((f) => f.id))
  const matches = Object.fromEntries(Object.entries(p.matches || {}).filter(([, id]) => ids.has(id)))
  return {
    data: { tender: p.tender, requirements: p.requirements },
    files,
    matches,
    expiry: p.expiry || {},
    expiryAuto: p.expiryAuto || {},
    withIndex: p.withIndex !== false,
  }
}
