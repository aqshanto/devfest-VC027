export const ST = {
  MISSING: 'MISSING',
  EXPIRY_NEEDED: 'EXPIRY_NEEDED',
  EXPIRED: 'EXPIRED',
  NOT_PROVIDED: 'NOT_PROVIDED',
  OK: 'OK',
}

export const BLOCKING = new Set([ST.MISSING, ST.EXPIRY_NEEDED, ST.EXPIRED])

// Problem §5. Dates are YYYY-MM-DD so string compare == date compare.
// Same day as the deadline is still OK.
export function getStatus(req, fileId, expiry, deadline) {
  if (!fileId) return req.mandatory ? ST.MISSING : ST.NOT_PROVIDED
  if (req.has_expiry) {
    if (!expiry) return ST.EXPIRY_NEEDED
    if (expiry < deadline) return ST.EXPIRED
  }
  return ST.OK
}

export function getAllStatuses(requirements, matches, expiry, deadline) {
  const out = {}
  for (const r of requirements) out[r.id] = getStatus(r, matches[r.id], expiry[r.id], deadline)
  return out
}

// Why can't `fileId` be matched to requirement `reqId`? Returns i18n key or null.
// One file → one document; a duplicate of a file used elsewhere is also blocked (task 4.6).
export function matchBlockReason(fileId, reqId, files, matches) {
  const file = files.find((f) => f.id === fileId)
  if (!file || file.error) return 'damaged'
  for (const [rid, fid] of Object.entries(matches)) {
    if (rid === reqId || !fid) continue
    if (fid === fileId) return 'usedElsewhere'
    const other = files.find((f) => f.id === fid)
    if (other && other.hash === file.hash) return 'dupUsed'
  }
  return null
}
