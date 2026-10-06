import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export const MAX_FILES = 30
export const MAX_BYTES = 50 * 1024 * 1024

const uid = () => Math.random().toString(36).slice(2, 10)

async function sha256(bytes) {
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const isPdfHeader = (bytes) => {
  // "%PDF-" may appear after a few junk bytes; check the first 1 KB
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024))
  return head.includes('%PDF-')
}

// Read one File → { id, name, size, bytes, pages, hash, error }
// error is an i18n key: 'notPdf' | 'damaged' | 'passwordPdf'
export async function readFile(file) {
  const base = { id: uid(), name: file.name, size: file.size }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const looksPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf'
  if (!looksPdf || !isPdfHeader(bytes)) return { ...base, error: 'notPdf' }

  try {
    // pdf.js transfers the buffer to its worker, so give it a copy
    const task = pdfjs.getDocument({ data: bytes.slice() })
    const pages = (await task.promise).numPages
    await task.destroy()
    return { ...base, bytes, pages, hash: await sha256(bytes) }
  } catch (e) {
    return { ...base, error: e?.name === 'PasswordException' ? 'passwordPdf' : 'damaged' }
  }
}

// Map fileId → name of the first other valid file with the same content
export function findDuplicates(files) {
  const firstByHash = {}
  const dupOf = {}
  for (const f of files) {
    if (f.error) continue
    if (firstByHash[f.hash]) {
      dupOf[f.id] = firstByHash[f.hash].name
      dupOf[firstByHash[f.hash].id] ??= f.name
    } else firstByHash[f.hash] = f
  }
  return dupOf
}

export const formatSize = (n) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`
