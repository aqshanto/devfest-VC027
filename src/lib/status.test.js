import { describe, expect, it } from 'vitest'
import { ST, getStatus, matchBlockReason } from './status.js'
import { parseTender } from './tender.js'

const DL = '2026-10-20'
const mand = { mandatory: true, has_expiry: false }
const opt = { mandatory: false, has_expiry: false }
const exp = { mandatory: true, has_expiry: true }

describe('getStatus', () => {
  it('missing / not provided', () => {
    expect(getStatus(mand, null, null, DL)).toBe(ST.MISSING)
    expect(getStatus(opt, null, null, DL)).toBe(ST.NOT_PROVIDED)
    expect(getStatus({ ...opt, has_expiry: true }, null, null, DL)).toBe(ST.NOT_PROVIDED)
  })
  it('expiry rules', () => {
    expect(getStatus(exp, 'f1', '', DL)).toBe(ST.EXPIRY_NEEDED)
    expect(getStatus(exp, 'f1', '2025-06-30', DL)).toBe(ST.EXPIRED)
    expect(getStatus(exp, 'f1', '2026-10-19', DL)).toBe(ST.EXPIRED)
    expect(getStatus(exp, 'f1', DL, DL)).toBe(ST.OK) // same day is OK
    expect(getStatus(exp, 'f1', '2027-06-30', DL)).toBe(ST.OK)
  })
  it('ok without expiry', () => {
    expect(getStatus(mand, 'f1', null, DL)).toBe(ST.OK)
  })
})

describe('matchBlockReason', () => {
  const files = [
    { id: 'a', hash: 'h1' },
    { id: 'b', hash: 'h1' }, // duplicate of a
    { id: 'c', hash: 'h2' },
  ]
  it('one file per document', () => {
    expect(matchBlockReason('c', 'R2', files, { R1: 'c' })).toBe('usedElsewhere')
    expect(matchBlockReason('c', 'R1', files, { R1: 'c' })).toBe(null)
  })
  it('duplicates cannot go to different documents', () => {
    expect(matchBlockReason('b', 'R2', files, { R1: 'a' })).toBe('dupUsed')
    expect(matchBlockReason('b', 'R1', files, { R1: 'a' })).toBe(null)
  })
})

describe('parseTender', () => {
  it('sorts by order and rejects bad json', () => {
    const t = parseTender(JSON.stringify({
      tender: { tender_id: 'T1', submission_deadline: DL },
      requirements: [{ id: 'B', order: 2, title_en: 'b' }, { id: 'A', order: 1, title_en: 'a' }],
    }))
    expect(t.requirements.map((r) => r.id)).toEqual(['A', 'B'])
    expect(() => parseTender('{bad')).toThrow('errJson')
    expect(() => parseTender('{}')).toThrow('errJsonFields')
    expect(() => parseTender(JSON.stringify({
      tender: { tender_id: 'T1', submission_deadline: DL },
      requirements: [{ id: 'A', order: 1, title_en: 'a' }, { id: 'A', order: 2, title_en: 'b' }],
    }))).toThrow('errJsonFields')
  })
})
