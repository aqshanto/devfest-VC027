// Takes README screenshots with headless Chrome. Needs the app running (npm run dev / preview).
// Run: node scripts/screenshots.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'

const base = process.argv[2] || 'http://localhost:5173/'
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const shots = [
  ['01-home-en', '?lang=en', 1440, 900],
  ['02-status-problems-en', '?sample=1&demo=problems&lang=en', 1440, 900],
  ['03-status-problems-bn', '?sample=1&demo=problems&lang=bn', 1440, 900],
  ['04-ready-en', '?sample=1&demo=ready&lang=en', 1440, 900],
  ['05-ready-dark-bn', '?sample=1&demo=ready&lang=bn&theme=dark', 1440, 900],
  ['06-mobile-bn', '?sample=1&demo=problems&lang=bn', 390, 844],
]

const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
for (const [name, query, width, height] of shots) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  // Headless Chrome swallows fetch() responses with application/pdf (returns 204),
  // so serve the sample PDFs from disk as octet-stream. Real browsers are not affected.
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const m = decodeURIComponent(new URL(req.url()).pathname).match(/^\/(sample\/documents\/.+\.pdf)$/)
    if (!m) return req.continue()
    req.respond({ status: 200, contentType: 'application/octet-stream', body: readFileSync('public/' + m[1]) })
  })
  await page.goto(base + query, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 7000)) // let files load and toasts fade
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
  await page.close()
  console.log('saved', name)
}
await browser.close()
