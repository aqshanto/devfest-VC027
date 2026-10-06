// Takes README screenshots with headless Chrome. Needs the app running (npm run dev / preview).
// Run: node scripts/screenshots.mjs [baseUrl]
import puppeteer from 'puppeteer-core'

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
  await page.goto(base + query, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 7000)) // let files load and toasts fade
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
  await page.close()
  console.log('saved', name)
}
await browser.close()
