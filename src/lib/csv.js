// Bonus: checklist export as CSV (document, file name, pages, expiry date, status).
const cell = (v) => {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function checklistCsv({ requirements, matches, expiry, files, statuses, lang, t }) {
  const head = ['Order', 'Document', 'Mandatory', 'File name', 'Pages', 'Expiry date', 'Status']
  const rows = requirements.map((r) => {
    const f = files.find((x) => x.id === matches[r.id])
    return [
      r.order,
      lang === 'bn' ? r.title_bn : r.title_en,
      r.mandatory ? t('mandatory') : t('optional'),
      f?.name || '',
      f?.pages ?? '',
      (r.has_expiry && expiry[r.id]) || '',
      t('st_' + statuses[r.id]),
    ]
  })
  // BOM so Excel opens Bangla text as UTF-8
  return '\uFEFF' + [head, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n'
}

export function downloadText(text, name, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
