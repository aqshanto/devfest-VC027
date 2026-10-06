// Smart Read on the real sample PDFs with meaningless file names: content alone must match.
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { autoMatch, guessReq } from './automatch.js'
import { detectExpiry } from './expiry.js'
import { parseTender } from './tender.js'

const dir = 'public/sample/'

async function textOf(bytes) {
  const doc = await pdfjs.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise
  let out = ''
  for (let i = 1; i <= Math.min(2, doc.numPages); i++) {
    out += (await (await doc.getPage(i)).getTextContent()).items.map((x) => x.str).join(' ') + ' '
  }
  return out.replace(/\s+/g, ' ').trim()
}

it('matches documents and finds expiry dates from PDF text', async () => {
  const { tender, requirements } = parseTender(readFileSync(dir + 'requirements.json', 'utf8'))
  const names = JSON.parse(readFileSync(dir + 'manifest.json', 'utf8')).filter((n) => n.endsWith('.pdf'))
  const files = []
  for (const [i, n] of names.entries()) {
    const text = await textOf(new Uint8Array(readFileSync(dir + 'documents/' + n)))
    files.push({ id: n, name: `file_${i}.pdf`, hash: n.replace(' (1)', ''), text, detectedExpiry: detectExpiry(text) })
  }
  const by = (n) => files.find((f) => f.id === n)
  expect(by('trade_license_2026.pdf').detectedExpiry).toBe('2027-06-30')
  expect(by('trade_license_2025.pdf').detectedExpiry).toBe('2025-06-30')
  expect(by('bank_solvency.pdf').detectedExpiry).toBe('2026-12-31')
  expect(guessReq(by('03_tin_certificate.pdf'), requirements, tender.submission_deadline)?.id).toBe('R02')

  const m = autoMatch(requirements, files, {}, tender.submission_deadline)
  expect(m).toMatchObject({
    R01: 'trade_license_2026.pdf',
    R02: '03_tin_certificate.pdf',
    R03: '04_vat_certificate.pdf',
    R04: 'bank_solvency.pdf',
    R08: '02_technical_proposal.pdf',
    R09: '01_financial_proposal.pdf',
  })
  expect(m.R05).toMatch(/^experience_cert/)
  expect(m.R06).toBeUndefined()
  expect(m.R07).toBeUndefined()
})
