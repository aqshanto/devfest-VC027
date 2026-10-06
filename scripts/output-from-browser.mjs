// Generates output/<tender_id>_Package.pdf through the real app UI in headless Chrome
// (so the Bangla index text, which needs a browser canvas, is included).
// Needs the app running. Run: node scripts/output-from-browser.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'

const base = process.argv[2] || 'http://localhost:5173/'
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(base + '?sample=1&demo=ready&lang=en', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000))
const b64 = await page.evaluate(async () => {
  let blob
  URL.createObjectURL = (b) => ((blob = b), '#')
  HTMLAnchorElement.prototype.click = () => {}
  const btn = (txt) => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === txt)
  btn('Generate package').click()
  for (let i = 0; i < 50 && !btn('Download'); i++) await new Promise((r) => setTimeout(r, 200))
  btn('Download').click()
  const buf = new Uint8Array(await blob.arrayBuffer())
  let s = ''
  for (const x of buf) s += String.fromCharCode(x)
  return btoa(s)
})
writeFileSync('output/T-2026-0417_Package.pdf', Buffer.from(b64, 'base64'))
console.log('saved output/T-2026-0417_Package.pdf')
await browser.close()
