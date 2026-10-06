import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { autoMatch } from './automatch.js'
import { parseTender } from './tender.js'

it('auto-matches the sample pack by file name', () => {
  const { requirements } = parseTender(readFileSync('public/sample/requirements.json', 'utf8'))
  const names = JSON.parse(readFileSync('public/sample/manifest.json', 'utf8'))
  const files = names.map((n) => ({
    id: n,
    name: n,
    error: n.endsWith('.png') ? 'notPdf' : undefined,
    hash: n.startsWith('experience_cert') ? 'same' : n,
  }))
  const m = autoMatch(requirements, files, {})
  expect(m).toMatchObject({
    R01: 'trade_license_2026.pdf',
    R02: '03_tin_certificate.pdf',
    R03: '04_vat_certificate.pdf',
    R04: 'bank_solvency.pdf',
    R08: '02_technical_proposal.pdf',
    R09: '01_financial_proposal.pdf',
  })
  expect(m.R05).toBe('experience_cert.pdf')
  expect(m.R06).toBeUndefined() // optional, no file
  expect(Object.values(m).filter((v) => v?.startsWith('experience_cert'))).toHaveLength(1)
})
