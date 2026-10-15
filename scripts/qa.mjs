/**
 * Browser QA against the generated static site (.output/public).
 *
 *   npm run generate && npm run qa
 *
 * For each locale and viewport it:
 *  - loads the page, scrolls through it so scroll animations run, and saves
 *    full-page screenshots to qa-output/
 *  - fails on console errors, failed requests, horizontal overflow and
 *    elements left invisible by animations
 *  - checks lang/dir, product links, language switcher targets and hreflang
 *  - repeats with prefers-reduced-motion: reduce
 *
 * Options: QA_SHOTS=0 skips screenshots. QA_ONLY=en|fa limits locales.
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, mkdir, stat } from 'node:fs/promises'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, '.output', 'public')
const out = join(root, 'qa-output')
const SHOTS = process.env.QA_SHOTS !== '0'
const ONLY = process.env.QA_ONLY

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
}

// Minimal static server mirroring typical static hosting (dir → index.html)
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = join(pub, p)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    try { await stat(file + '.html'); file += '.html' } catch { file = null }
  }
  if (!file) { res.writeHead(404); res.end(await readFile(join(pub, '404.html'))); return }
  try {
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  } catch { res.writeHead(404); res.end() }
})
await new Promise((r) => server.listen(4173, r))
const base = 'http://localhost:4173'

async function launch() {
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { return await chromium.launch(channel ? { channel } : {}) } catch {}
  }
  throw new Error('No Chromium-based browser found')
}

const viewports = [
  { name: '320', width: 320, height: 640, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1728', width: 1728, height: 1080 },
]
const locales = ['en', 'fa'].filter((l) => !ONLY || l === ONLY)

const failures = []
const fail = (ctx, msg) => { failures.push(`[${ctx}] ${msg}`); console.log(`  ✗ ${msg}`) }
const pass = (msg) => console.log(`  ✓ ${msg}`)

await mkdir(out, { recursive: true })
const browser = await launch()

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
    await new Promise((r) => setTimeout(r, 1800))
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
  })
}

async function checkPage(locale, vp, reducedMotion) {
  const ctx = `${locale} ${vp.name}${reducedMotion ? ' reduced' : ''}`
  console.log(`\n${ctx}`)
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`) })

  await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' })
  // Page loader must lift by itself, then the hero intro runs
  await page.waitForFunction(() => !document.querySelector('.loader'), null, { timeout: 9000 })
    .then(() => pass('page loader finished'))
    .catch(() => fail(ctx, 'page loader still visible after 9 s'))
  await page.waitForTimeout(reducedMotion ? 300 : 2600)
  await scrollThrough(page)

  errors.length ? errors.forEach((e) => fail(ctx, `console/network: ${e}`)) : pass('no console or network errors')

  const html = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  const wantDir = locale === 'fa' ? 'rtl' : 'ltr'
  html.dir === wantDir && html.lang.startsWith(locale) ? pass(`lang=${html.lang} dir=${html.dir}`) : fail(ctx, `lang/dir ${JSON.stringify(html)}`)

  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth
    const offenders = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0) continue
      if (r.right > w + 1 || r.left < -1) {
        // ignore content clipped by an overflow-hidden/clip ancestor
        let a = el.parentElement, clipped = false
        while (a && a !== document.body) {
          const s = getComputedStyle(a)
          if (/(hidden|clip)/.test(s.overflowX)) { const ar = a.getBoundingClientRect(); if (ar.right <= w + 1 && ar.left >= -1) { clipped = true; break } }
          a = a.parentElement
        }
        if (!clipped) offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(r.left)}→${Math.round(r.right)})`)
      }
    }
    return { scroll: document.documentElement.scrollWidth > w, offenders: offenders.slice(0, 6) }
  })
  !overflow.scroll && !overflow.offenders.length ? pass('no horizontal overflow') : fail(ctx, `overflow: ${JSON.stringify(overflow)}`)

  // Any text left hidden after animations ran?
  const hidden = await page.evaluate(() => {
    const bad = []
    for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main p, main li, main a')) {
      if (el.closest('[aria-hidden="true"], .visually-hidden, [hidden]')) continue
      let n = el, op = 1, vis = true
      while (n && n !== document.body) {
        const s = getComputedStyle(n)
        op *= parseFloat(s.opacity)
        if (s.visibility === 'hidden') vis = false
        n = n.parentElement
      }
      if (op < 0.95 || !vis) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}: "${el.textContent.trim().slice(0, 40)}" op=${op.toFixed(2)}`)
    }
    return bad.slice(0, 8)
  })
  hidden.length ? fail(ctx, `content left hidden: ${hidden.join(' | ')}`) : pass('all content visible after scroll')

  if (vp.name === '1440' && !reducedMotion) {
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="https://mi"]')].map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel })))
    const hosts = new Set(links.map((l) => l.href))
    hosts.has('https://midesk.ir/') && hosts.has('https://mifin.ir/') ? pass(`product links: ${[...hosts].join(', ')}`) : fail(ctx, `product links ${[...hosts]}`)
    links.every((l) => l.target === '_blank' && l.rel.includes('noopener')) ? pass('external links use noopener') : fail(ctx, 'external link missing noopener')

    const other = locale === 'en' ? 'fa' : 'en'
    const sw = await page.$$eval(`a[hreflang="${other}"]`, (as) => as.map((a) => a.getAttribute('href')))
    sw.length && sw.every((h) => h === `/${other}/`) ? pass(`switcher → ${sw[0]}`) : fail(ctx, `switcher hrefs ${sw}`)

    // Switching from a section keeps the section
    await page.goto(`${base}/${locale}/#approach`, { waitUntil: 'networkidle' })
    await page.click(`header a[hreflang="${other}"]`)
    await page.waitForLoadState('networkidle')
    const after = new URL(page.url())
    after.pathname === `/${other}/` && after.hash === '#approach' ? pass(`switch keeps context: ${after.pathname}${after.hash}`) : fail(ctx, `switch went to ${page.url()}`)
    await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' })

    // Internal anchors resolve
    const anchors = await page.$$eval('a[href^="#"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))])
    const missing = []
    for (const a of anchors) if (!(await page.$(a))) missing.push(a)
    missing.length ? fail(ctx, `missing anchors ${missing}`) : pass(`anchors ok: ${anchors.join(' ')}`)
  }

  if (vp.name === '390' && !reducedMotion) {
    // Mobile menu: opens, focuses first link, closes on Escape and returns focus
    await page.click('.header__toggle')
    await page.waitForTimeout(350)
    const st = await page.evaluate(() => ({
      expanded: document.querySelector('.header__toggle').getAttribute('aria-expanded'),
      visible: !document.querySelector('#mobile-menu').hidden,
      focus: document.activeElement?.className,
    }))
    if (SHOTS) await page.screenshot({ path: join(out, `${locale}-${vp.name}-menu.png`) })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    const closed = await page.evaluate(() => ({ hidden: document.querySelector('#mobile-menu').hidden, focus: document.activeElement?.className }))
    st.expanded === 'true' && st.visible && /menu__link/.test(st.focus) && closed.hidden && /header__toggle/.test(closed.focus)
      ? pass('mobile menu: open, focus, Escape, focus return')
      : fail(ctx, `mobile menu ${JSON.stringify({ st, closed })}`)
  }

  if (SHOTS) await page.screenshot({ path: join(out, `${locale}-${vp.name}${reducedMotion ? '-reduced' : ''}.png`), fullPage: true })
  await context.close()
}

for (const locale of locales) {
  for (const vp of viewports) await checkPage(locale, vp, false)
  await checkPage(locale, viewports[1], true)
  await checkPage(locale, viewports[4], true)
}

// Root entry page and sitemap
{
  console.log('\nroot /')
  const page = await browser.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  const res = await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  const hrefs = await page.$$eval('a[hreflang]', (as) => as.map((a) => a.getAttribute('href')))
  res.status() === 200 && hrefs.includes('/fa/') && hrefs.includes('/en/') && new URL(page.url()).pathname === '/'
    ? pass('root renders both language links, no redirect')
    : fail('root', `status ${res.status()} hrefs ${hrefs} url ${page.url()}`)
  errs.length ? fail('root', errs.join(', ')) : pass('no errors')
  const rootText = await page.textContent('main')
  const rootOk = !/[{}]/.test(rootText) && rootText.includes('Choose your language') && rootText.includes('زبان را انتخاب کنید')
  if (rootOk) pass('entry copy renders in both languages')
  else fail('root', 'entry copy did not render as plain text')
  if (SHOTS) {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.screenshot({ path: join(out, 'root-1280.png') })
  }
  const sm = await (await fetch(`${base}/sitemap.xml`)).text()
  ;['https://milabs.ir/en/', 'https://milabs.ir/fa/', 'hreflang="x-default"'].every((s) => sm.includes(s))
    ? pass('sitemap lists localized URLs with alternates')
    : fail('sitemap', 'missing entries')
  const r404 = await page.goto(`${base}/en/missing-page`)
  r404.status() === 404 ? pass('unknown URL returns 404') : fail('404', `status ${r404.status()}`)
  await page.close()
}

await browser.close()
server.close()
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nAll QA checks passed')
process.exit(failures.length ? 1 : 0)
