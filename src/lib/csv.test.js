import { expect, it } from 'vitest'
import { checklistCsv } from './csv.js'

it('builds checklist csv with BOM and escaping', () => {
  const csv = checklistCsv({
    requirements: [
      { id: 'R1', order: 1, title_en: 'Trade License', title_bn: 'ট্রেড লাইসেন্স', mandatory: true, has_expiry: true },
      { id: 'R2', order: 2, title_en: 'Audit, Report', title_bn: 'x', mandatory: false, has_expiry: false },
    ],
    matches: { R1: 'f1' },
    expiry: { R1: '2027-06-30' },
    files: [{ id: 'f1', name: 'trade "2026".pdf', pages: 1 }],
    statuses: { R1: 'OK', R2: 'NOT_PROVIDED' },
    lang: 'en',
    t: (k) => k,
  })
  const lines = csv.split('\r\n')
  expect(csv.startsWith('\uFEFFOrder,Document')).toBe(true)
  expect(lines[1]).toBe('1,Trade License,mandatory,"trade ""2026"".pdf",1,2027-06-30,st_OK')
  expect(lines[2]).toBe('2,"Audit, Report",optional,,,,st_NOT_PROVIDED')
})

it('neutralises spreadsheet formulas in cells', () => {
  const csv = checklistCsv({
    requirements: [{ id: 'R1', order: 1, title_en: 'X', title_bn: 'X', mandatory: true, has_expiry: false }],
    matches: { R1: 'f1' },
    expiry: {},
    files: [{ id: 'f1', name: '=HYPERLINK("http://x")', pages: 1 }],
    statuses: { R1: 'OK' },
    lang: 'en',
    t: (k) => k,
  })
  expect(csv.split('\r\n')[1]).toContain(`"'=HYPERLINK(""http://x"")"`)
})
