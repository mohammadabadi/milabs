/**
 * Captures the README screenshots from the static build.
 *
 *   npm run generate && npm run screenshots
 *
 * Writes to docs/screenshots/. Uses a locally installed Chrome or Edge,
 * or Playwright's Chromium.
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, mkdir, stat } from 'node:fs/promises'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, '.output', 'public')
const out = join(root, 'docs', 'screenshots')

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml',
}
const server = createServer(async (req, res) => {
  let file = join(pub, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise((r) => server.listen(4190, r))
const base = 'http://localhost:4190'

async function launch() {
  for (const channel of ['chrome', 'msedge', undefined]) {
    try {
      return await chromium.launch(channel ? { channel } : {})
    } catch {}
  }
  throw new Error('No Chromium-based browser found. Run `npx playwright install chromium`.')
}

await mkdir(out, { recursive: true })
const browser = await launch()

/** Opens a page, waits for the loader and intro, optionally scrolls to a section. */
async function shot(name, { locale, width, height, scale = 1, section, wait = 0, hover, mobile = false }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile })
  await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => !document.querySelector('.loader'), null, { timeout: 10000 })
  await page.waitForTimeout(2600)
  if (section) {
    await page.evaluate((s) => {
      const el = document.querySelector(s)
      if (!el) return
      const r = el.getBoundingClientRect()
      // center tall elements, align short ones under the header
      const y = r.top + window.scrollY - (r.height < window.innerHeight * 0.7 ? (window.innerHeight - r.height) / 2 : 70)
      window.scrollTo(0, y)
    }, section)
    await page.waitForTimeout(2600)
  }
  if (wait) await page.waitForTimeout(wait)
  if (hover) await page.hover(hover).catch(() => {})
  await page.screenshot({ path: join(out, `${name}.png`) })
  await page.close()
  console.log('✓', name)
}

/** The first-load screen, caught while the logo is filling. */
async function loaderShot() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 200, downloadThroughput: 200 * 1024, uploadThroughput: 200 * 1024 })
  await page.goto(`${base}/en/`, { waitUntil: 'commit' })
  await page.waitForSelector('.loader', { state: 'visible', timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(out, 'loader.png'), clip: { x: 520, y: 300, width: 400, height: 300 } })
  await page.close()
  console.log('✓ loader')
}

// Hero: wait one rotation so the particles have formed the MiDesk board
await shot('hero-en', { locale: 'en', width: 1440, height: 900, wait: 3200 })
await shot('hero-fa', { locale: 'fa', width: 1440, height: 900, wait: 3200 })
await shot('product-midesk', { locale: 'en', width: 1440, height: 900, section: '#midesk' })
await shot('product-mifin-fa', { locale: 'fa', width: 1440, height: 900, section: '#mifin' })
await shot('family', { locale: 'en', width: 1440, height: 900, section: '#family .eco__grid', hover: '#family .eco__diagram' })
await shot('approach-fa', { locale: 'fa', width: 1440, height: 900, section: '#approach' })
await shot('mobile-en', { locale: 'en', width: 390, height: 844, scale: 2, mobile: true })
await shot('mobile-fa', { locale: 'fa', width: 390, height: 844, scale: 2, mobile: true })
await loaderShot()

await browser.close()
server.close()
