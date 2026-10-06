const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Parse + validate requirements.json text. Throws Error('errJson' | 'errJsonFields') (i18n keys).
export function parseTender(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('errJson')
  }
  const tender = data?.tender
  const reqs = data?.requirements
  if (!tender || typeof tender !== 'object' || !Array.isArray(reqs) || reqs.length === 0) throw new Error('errJsonFields')
  if (!tender.tender_id || !DATE_RE.test(tender.submission_deadline || '')) throw new Error('errJsonFields')

  const requirements = reqs.map((r, i) => {
    if (!r || !r.id || !r.title_en) throw new Error('errJsonFields')
    return {
      id: String(r.id),
      order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
      title_en: String(r.title_en),
      title_bn: String(r.title_bn || r.title_en),
      mandatory: r.mandatory !== false,
      has_expiry: r.has_expiry === true,
    }
  })
  if (new Set(requirements.map((r) => r.id)).size !== requirements.length) throw new Error('errJsonFields')
  requirements.sort((a, b) => a.order - b.order)

  return {
    tender: {
      tender_id: String(tender.tender_id),
      title: String(tender.title || ''),
      procuring_entity: String(tender.procuring_entity || ''),
      bidder: String(tender.bidder || ''),
      submission_deadline: tender.submission_deadline,
    },
    requirements,
  }
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysUntil(iso) {
  return Math.round((Date.parse(iso) - Date.parse(todayISO())) / 86400000)
}
