/**
 * Renders raster brand assets from HTML/SVG sources with Playwright:
 *  - public/og/milabs-en.png, public/og/milabs-fa.png (1200×630 social cards)
 *  - public/apple-touch-icon.png (180), public/brand/milabs-symbol-{192,512}.png
 *  - public/favicon.ico (32×32 PNG-in-ICO)
 *
 * Usage: npm run assets:brand  (uses an installed Chrome/Edge, or Playwright's Chromium)
 * Re-run after changing the logo, palette or OG copy.
 */
import { chromium } from 'playwright'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = (p) => join(root, 'public', p)
const font = async (file) => (await readFile(pub(join('fonts', file)))).toString('base64')

async function launch() {
  for (const channel of ['chrome', 'msedge', undefined]) {
    try {
      return await chromium.launch(channel ? { channel } : {})
    } catch {}
  }
  throw new Error('No Chromium-based browser found. Run `npx playwright install chromium`.')
}

const symbol = await readFile(pub('favicon.svg'), 'utf8')
const inter = await font('instrument-sans-latin-wght.woff2')
const serif = await font('instrument-serif-latin-italic.woff2')
const yekan = (await readFile(pub('fonts/yekan-bakh-fanum-700.woff2'))).toString('base64')

const fonts = `
@font-face{font-family:IS;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900}
@font-face{font-family:ISerif;font-style:italic;src:url(data:font/woff2;base64,${serif}) format('woff2')}
@font-face{font-family:Vz;src:url(data:font/woff2;base64,${yekan}) format('woff2');font-weight:100 900}
`

const og = {
  en: { dir: 'ltr', title: 'Software that brings order to <em>work</em> and <em>money</em>.', font: 'IS' },
  fa: { dir: 'rtl', title: 'نرم‌افزارهایی که به <em>کار</em> و <em>پول</em> نظم می‌دهند.', font: 'Vz' },
}

function ogHtml({ dir, title, font: f }) {
  return `<!doctype html><html dir="${dir}"><head><style>${fonts}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#f4f2ed;color:#141413;font-family:${f},IS;position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(20,20,19,.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(20,20,19,.08) 1px,transparent 1px);background-size:60px 60px}
  .wrap{position:absolute;inset:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
  .brand{display:flex;align-items:center;gap:16px;font-family:IS;font-weight:600;font-size:34px;letter-spacing:-1px;direction:ltr;align-self:flex-start}
  [dir=rtl] .brand{align-self:flex-end}
  .brand svg{width:52px;height:52px}
  h1{font-weight:${f === 'Vz' ? 700 : 500};font-size:${f === 'Vz' ? 72 : 82}px;line-height:${f === 'Vz' ? 1.35 : 1};letter-spacing:${f === 'Vz' ? 0 : -3}px;max-width:900px}
  em{font-family:${f === 'Vz' ? 'Vz' : 'ISerif'};font-style:${f === 'Vz' ? 'normal' : 'italic'};font-weight:${f === 'Vz' ? 400 : 400};color:#b23a0e}
  .row{display:flex;gap:14px;direction:ltr;font-family:IS;font-weight:600;font-size:28px;letter-spacing:-.5px}
  [dir=rtl] .row{justify-content:flex-end}
  .chip{padding:10px 20px;border-radius:99px;background:#141413;color:#f4f2ed}
  .chip b{font-weight:600}
  .d b{color:#8fa6ff}.f b{color:#5fd3a2}
  </style></head><body><div class="grid"></div><div class="wrap">
  <div class="brand">${symbol}MiLabs</div>
  <h1>${title}</h1>
  <div class="row"><span class="chip d"><b>Mi</b>Desk</span><span class="chip f"><b>Mi</b>Fin</span></div>
  </div></body></html>`
}

const browser = await launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await mkdir(pub('og'), { recursive: true })
for (const [code, cfg] of Object.entries(og)) {
  await page.setContent(ogHtml(cfg), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: pub(`og/milabs-${code}.png`) })
}

async function icon(size, path, pad = 0) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<html><body style="margin:0;background:${pad ? '#f4f2ed' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">${symbol.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</body></html>`,
  )
  return page.screenshot({ path, omitBackground: !pad })
}
await mkdir(pub('brand'), { recursive: true })
await icon(180, pub('apple-touch-icon.png'), 18)
await icon(192, pub('brand/milabs-symbol-192.png'))
await icon(512, pub('brand/milabs-symbol-512.png'))
const png32 = await icon(32, join(root, 'node_modules', '.cache', 'favicon-32.png'))

// ICO container with a single embedded 32×32 PNG
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header.writeUInt8(32, 6)
header.writeUInt8(32, 7)
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(png32.length, 14)
header.writeUInt32LE(22, 18)
await writeFile(pub('favicon.ico'), Buffer.concat([header, png32]))

await browser.close()
console.log('Brand assets written to public/')
