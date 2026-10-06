import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const A4 = [595.28, 841.89]
const FOOTER_BAND = 30 // pt reserved at the bottom of every page for the footer
const INDIGO = rgb(0.31, 0.27, 0.9)
const VIOLET = rgb(0.49, 0.23, 0.93)
const DARK = rgb(0.12, 0.13, 0.2)
const GREY = rgb(0.42, 0.45, 0.52)
const LINE = rgb(0.86, 0.87, 0.9)

// Standard fonts only support WinAnsi; replace anything else so pdf-lib never throws.
function safeText(font, text) {
  let out = ''
  for (const ch of String(text ?? '')) {
    try {
      font.encodeText(ch)
      out += ch
    } catch {
      out += '?'
    }
  }
  return out
}

function fit(font, text, size, maxWidth) {
  let s = safeText(font, text)
  if (font.widthOfTextAtSize(s, size) <= maxWidth) return s
  while (s.length > 1 && font.widthOfTextAtSize(s + '...', size) > maxWidth) s = s.slice(0, -1)
  return s + '...'
}

// Documents that go into the package, in tender order, with their files.
export function includedDocs(requirements, matches, files) {
  return [...requirements]
    .sort((a, b) => a.order - b.order)
    .filter((r) => matches[r.id])
    .map((r) => ({ req: r, file: files.find((f) => f.id === matches[r.id]) }))
    .filter((d) => d.file && !d.file.error)
}

function drawCover(page, fonts, tender, docs, startPages, generatedOn) {
  const { reg, bold } = fonts
  const [W, H] = A4
  const M = 50

  // Header band
  page.drawRectangle({ x: 0, y: H - 150, width: W, height: 150, color: INDIGO })
  page.drawRectangle({ x: 0, y: H - 150, width: W, height: 6, color: VIOLET })
  page.drawText('TENDER SUBMISSION PACKAGE', { x: M, y: H - 60, size: 11, font: bold, color: rgb(0.85, 0.85, 1) })
  page.drawText(fit(bold, tender.title || tender.tender_id, 24, W - 2 * M), { x: M, y: H - 95, size: 24, font: bold, color: rgb(1, 1, 1) })
  page.drawText(fit(reg, tender.tender_id, 13, W - 2 * M), { x: M, y: H - 122, size: 13, font: reg, color: rgb(0.9, 0.9, 1) })

  // Details
  const rows = [
    ['Tender ID', tender.tender_id],
    ['Tender title', tender.title],
    ['Procuring entity', tender.procuring_entity],
    ['Bidder', tender.bidder],
    ['Submission deadline', tender.submission_deadline],
    ['Package generated on', generatedOn],
  ]
  let y = H - 190
  for (const [label, value] of rows) {
    page.drawText(label, { x: M, y, size: 10, font: reg, color: GREY })
    page.drawText(fit(bold, value || '-', 11, W - M - 200), { x: 200, y, size: 11, font: bold, color: DARK })
    y -= 22
  }

  // Included documents table
  y -= 18
  page.drawText('Included documents', { x: M, y, size: 14, font: bold, color: DARK })
  y -= 24
  const cols = { no: M, doc: M + 34, file: M + 250, pages: W - M - 100, start: W - M - 40 }
  page.drawRectangle({ x: M - 6, y: y - 6, width: W - 2 * M + 12, height: 22, color: rgb(0.95, 0.95, 0.99) })
  const head = [['#', cols.no], ['Document', cols.doc], ['File', cols.file], ['Pages', cols.pages], ['Starts', cols.start]]
  for (const [txt, x] of head) page.drawText(txt, { x, y, size: 9, font: bold, color: GREY })
  y -= 24
  docs.forEach(({ req, file }, i) => {
    if (y < FOOTER_BAND + 30) return
    page.drawText(String(i + 1), { x: cols.no, y, size: 10, font: bold, color: INDIGO })
    page.drawText(fit(bold, req.title_en, 10, cols.file - cols.doc - 10), { x: cols.doc, y, size: 10, font: bold, color: DARK })
    page.drawText(fit(reg, file.name, 9, cols.pages - cols.file - 10), { x: cols.file, y, size: 9, font: reg, color: GREY })
    page.drawText(String(file.pages), { x: cols.pages, y, size: 10, font: reg, color: DARK })
    page.drawText(String(startPages[i]), { x: cols.start, y, size: 10, font: reg, color: DARK })
    page.drawLine({ start: { x: M - 6, y: y - 8 }, end: { x: W - M + 6, y: y - 8 }, thickness: 0.5, color: LINE })
    y -= 22
  })
}

function drawFooter(page, font, text) {
  const { width } = page.getSize()
  const size = 9
  page.drawLine({ start: { x: 36, y: FOOTER_BAND - 6 }, end: { x: width - 36, y: FOOTER_BAND - 6 }, thickness: 0.5, color: LINE })
  const w = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: (width - w) / 2, y: 10, size, font, color: DARK })
}

/**
 * Build the package (Problem §6).
 * opts.extraFrontPages: optional async (pdf, fonts, ctx) => number of pages it inserted after the cover (bonus index page)
 * Returns { bytes: Uint8Array, totalPages }.
 */
export async function buildPackage({ tender, requirements, matches, files, generatedOn, extraFrontPages }) {
  const docs = includedDocs(requirements, matches, files)
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${tender.tender_id} Package`)
  pdf.setProducer('Tender Package Builder')
  const fonts = {
    reg: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  }

  const frontCount = 1 + (extraFrontPages?.count || 0)
  const startPages = []
  let next = frontCount + 1
  for (const d of docs) {
    startPages.push(next)
    next += d.file.pages
  }

  const cover = pdf.addPage(A4)
  drawCover(cover, fonts, tender, docs, startPages, generatedOn)
  if (extraFrontPages) await extraFrontPages.draw(pdf, fonts, { docs, startPages, A4, FOOTER_BAND })

  // Each source page is embedded and scaled into a page of the same size,
  // leaving a blank band at the bottom so the footer never covers content.
  for (const { file } of docs) {
    const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
    const embedded = await pdf.embedPages(src.getPages())
    embedded.forEach((ep, i) => {
      const srcPage = src.getPage(i)
      const angle = ((srcPage.getRotation().angle % 360) + 360) % 360
      const turned = angle === 90 || angle === 270
      const w = turned ? ep.height : ep.width
      const h = turned ? ep.width : ep.height
      const page = pdf.addPage([w, h])
      const s = (h - FOOTER_BAND) / h
      const dw = w * s
      const dh = h * s
      const x0 = (w - dw) / 2
      const y0 = FOOTER_BAND
      if (!turned && angle === 0) page.drawPage(ep, { x: x0, y: y0, xScale: s, yScale: s })
      else if (angle === 180) page.drawPage(ep, { x: x0 + dw, y: y0 + dh, xScale: s, yScale: s, rotate: { type: 'degrees', angle: 180 } })
      else if (angle === 90) page.drawPage(ep, { x: x0, y: y0 + dh, xScale: s, yScale: s, rotate: { type: 'degrees', angle: -90 } })
      else page.drawPage(ep, { x: x0 + dw, y: y0, xScale: s, yScale: s, rotate: { type: 'degrees', angle: 90 } })
    })
  }

  const pages = pdf.getPages()
  const total = pages.length
  pages.forEach((p, i) => drawFooter(p, fonts.reg, safeText(fonts.reg, `${tender.tender_id} | Page ${i + 1} of ${total}`)))

  return { bytes: await pdf.save(), totalPages: total }
}

export function downloadBytes(bytes, name) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
