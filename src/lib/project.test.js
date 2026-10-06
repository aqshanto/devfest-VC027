import { expect, it } from 'vitest'
import { exportProject, importProject } from './project.js'

it('round-trips a project with file bytes', () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 0, 255, 128])
  const text = exportProject({
    data: { tender: { tender_id: 'T1', submission_deadline: '2026-10-20' }, requirements: [{ id: 'R1' }] },
    files: [{ id: 'f1', name: 'a.pdf', bytes, pages: 1, hash: 'h', thumb: 'data:x' }, { id: 'f2', name: 'b.png', error: 'notPdf' }],
    matches: { R1: 'f1', R2: 'gone' },
    expiry: { R1: '2027-01-01' },
    expiryAuto: { R1: true },
    withIndex: false,
  })
  const p = importProject(text)
  expect(p.data.tender.tender_id).toBe('T1')
  expect([...p.files[0].bytes]).toEqual([...bytes])
  expect(p.files[0].thumb).toBeUndefined()
  expect(p.matches).toEqual({ R1: 'f1' })
  expect(p.expiry.R1).toBe('2027-01-01')
  expect(p.withIndex).toBe(false)
  expect(() => importProject('{"a":1}')).toThrow('badProject')
  expect(() => importProject('nope')).toThrow('badProject')
})
