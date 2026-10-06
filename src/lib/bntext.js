// Bangla on the PDF: standard PDF fonts have no Bangla glyphs and pdf-lib does not shape
// conjuncts, so the browser draws the text on a canvas (correct shaping) and we embed a PNG.
const SCALE = 4

export async function textImage(text, { size = 12, weight = 600, color = '#1f2133' } = {}) {
  const family = '"Hind Siliguri", "Noto Sans Bengali", sans-serif'
  try {
    await document.fonts.load(`${weight} ${size * SCALE}px "Hind Siliguri"`, text)
  } catch {}
  const font = `${weight} ${size * SCALE}px ${family}`
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + 2
  const h = Math.ceil(size * SCALE * 1.6)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const c = canvas.getContext('2d')
  c.font = font
  c.fillStyle = color
  c.textBaseline = 'alphabetic'
  c.fillText(text, 1, Math.round(size * SCALE * 1.15))
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'))
  // width/height in PDF points; baselineOffset = distance from image bottom to the text baseline
  return {
    png: new Uint8Array(await blob.arrayBuffer()),
    width: w / SCALE,
    height: h / SCALE,
    baselineOffset: h / SCALE - size * 1.15,
  }
}
