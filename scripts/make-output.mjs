// Builds output/<tender_id>_Package.pdf from the sample pack with the same code the app uses.
// Run: node scripts/make-output.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
import { buildPackage } from '../src/lib/package.js'
import { parseTender, todayISO } from '../src/lib/tender.js'
import { getAllStatuses, BLOCKING } from '../src/lib/status.js'

const dir = 'public/sample/'
const { tender, requirements } = parseTender(readFileSync(dir + 'requirements.json', 'utf8'))

// Resolved sample-pack problems: 2025 trade license is expired, experience_cert (1) is a duplicate,
// company_logo.png is not a PDF, scan_0042.pdf is the signed declaration.
const pick = {
  R01: ['trade_license_2026.pdf', '2027-06-30'],
  R02: ['03_tin_certificate.pdf'],
  R03: ['04_vat_certificate.pdf'],
  R04: ['bank_solvency.pdf', '2026-12-31'],
  R05: ['experience_cert.pdf'],
  R08: ['02_technical_proposal.pdf'],
  R09: ['01_financial_proposal.pdf'],
  R10: ['scan_0042.pdf'],
}
const files = []
const matches = {}
const expiry = {}
for (const [rid, [name, date]] of Object.entries(pick)) {
  const bytes = new Uint8Array(readFileSync(dir + 'documents/' + name))
  const pages = (await PDFDocument.load(bytes)).getPageCount()
  files.push({ id: name, name, size: bytes.length, bytes, pages, hash: createHash('sha256').update(bytes).digest('hex') })
  matches[rid] = name
  if (date) expiry[rid] = date
}
const st = getAllStatuses(requirements, matches, expiry, tender.submission_deadline)
const blocked = Object.entries(st).filter(([, s]) => BLOCKING.has(s))
if (blocked.length) throw new Error('Blocked: ' + JSON.stringify(blocked))

const { bytes, totalPages } = await buildPackage({ tender, requirements, matches, files, generatedOn: todayISO(), withIndex: true })
const out = `output/${tender.tender_id}_Package.pdf`
writeFileSync(out, bytes)
console.log(out, totalPages, 'pages', st)
