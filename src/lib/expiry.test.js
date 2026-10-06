import { describe, expect, it } from 'vitest'
import { detectExpiry } from './expiry.js'

describe('detectExpiry', () => {
  it('reads the sample formats', () => {
    expect(detectExpiry('Date of Issue 2026-07-01 VALID UNTIL (EXPIRY DATE):  30 June 2027  (2027-06-30)')).toBe('2027-06-30')
    expect(detectExpiry('Date: 2026-09-01 ... VALID UNTIL (EXPIRY DATE): 31 December 2026 (2026-12-31)')).toBe('2026-12-31')
  })
  it('reads other common formats', () => {
    expect(detectExpiry('Expiry date: 15/03/2027')).toBe('2027-03-15')
    expect(detectExpiry('This certificate expires on March 5, 2027.')).toBe('2027-03-05')
    expect(detectExpiry('Validity: 2027.01.31')).toBe('2027-01-31')
  })
  it('ignores dates without an expiry keyword and invalid dates', () => {
    expect(detectExpiry('Date of Issue 2026-07-01')).toBe(null)
    expect(detectExpiry('Valid until 31/02/2027')).toBe(null)
    expect(detectExpiry('')).toBe(null)
  })
})
