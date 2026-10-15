# MiLabs content and asset guide

How to update copy, replace the placeholder product visuals, and add new Mi products.

> **Current status (October 2026).** The MiDesk and MiFin websites are not live yet. All product copy is based on the verified product descriptions in the project brief. Every product visual is a **coded placeholder illustration**, not a screenshot. The site labels each one "Illustrative interface, not a product screenshot".

---

## 1. Where the copy lives

| What | File |
| --- | --- |
| All interface and editorial copy for **English** | `i18n/locales/en.json` |
| All interface and editorial copy for **Persian** | `i18n/locales/fa.json` |
| Product copy (tagline, summary, audience, capabilities, alt text, SEO), both languages | `app/data/products.ts` → `copy.en` / `copy.fa` |
| Site-wide facts (domain, contact e-mail, social profiles) | `app/data/site.ts` |
| Language entry page at `/` (both languages) | `app/data/entry.ts` |

Rules:

- The two locale files must have identical keys. `npm run check:locales` verifies this.
- In headings, `*text*` marks the emphasized phrase (italic serif in English, a lighter weight in Persian). Keep exactly one or two emphasized phrases per heading.
- Write each language natively. The Persian and English sentences don't need to match one-to-one, but they must carry the same information.
- Product names (`MiDesk`, `MiFin`) are never translated and are always written in Latin script, including in Persian text.
- Only describe **verified** capabilities. Do not add statistics, testimonials, customer logos, integrations or certifications that the product team has not confirmed.

### Contact and social links

`app/data/site.ts`:

```ts
contactEmail: '',      // e.g. 'hello@milabs.ir'. When set, "Contact" appears in the header and footer
social: [],            // e.g. [{ label: 'LinkedIn', url: 'https://…' }]. Rendered in the footer and in structured data
```

Both are empty on purpose: no contact details or social accounts were verified when the site was built.

---

## 2. Where the assets belong

```
public/
├─ favicon.svg, favicon.ico, apple-touch-icon.png, site.webmanifest
├─ brand/                       MiLabs symbol (SVG + 192/512 PNG)
├─ og/                          Social preview images (milabs-en.png, milabs-fa.png), 1200×630
└─ images/products/
   ├─ placeholders/             ← provisional assets, to be replaced
   │   ├─ midesk-logo-placeholder.svg
   │   └─ mifin-logo-placeholder.svg
   ├─ midesk/                   ← put final MiDesk assets here (create the folder)
   └─ mifin/                    ← put final MiFin assets here
```

The coded interface illustrations live in `app/components/products/placeholders/` (`MiDeskPreview.vue`, `MiFinPreview.vue`). They read all of their text from the `mock.*` keys in the locale files.

---

## 3. Placeholders that need replacing

| Placeholder | Used for | Replace with |
| --- | --- | --- |
| `MiDeskPreview.vue` (coded illustration) | MiDesk visual in the hero and the product section | Real MiDesk screenshot(s) |
| `MiFinPreview.vue` (coded illustration) | MiFin visual in the hero and the product section | Real MiFin screenshot(s) |
| `placeholders/midesk-logo-placeholder.svg` | Reserved product logo slot (`product.logo`) | Official MiDesk logo (SVG) |
| `placeholders/mifin-logo-placeholder.svg` | Reserved product logo slot (`product.logo`) | Official MiFin logo (SVG) |
| `accent` colors in `app/data/products.ts` | Product accent colors throughout the site | Official product brand colors |
| `status: 'launching'` in `app/data/products.ts` | "Website launching soon" note | `'live'` once each product website is public |
| no `demo` in `app/data/products.ts` | Live demo button hidden | A `demo` entry once the product has a public demo (section 6) |

The MiLabs wordmark and symbol (`app/components/ui/BrandMark.vue`, `public/favicon.svg`) were created for this site because no official logo existed. If an official MiLabs identity is produced, replace both files and run `npm run assets:brand` to regenerate the PNG and ICO files.

---

## 4. Image specifications

### Product screenshots

| Property | Value |
| --- | --- |
| Aspect ratio | **16:10** (the frame is fixed at 16:10; other ratios are cropped from the top center) |
| Master size | 3200×2000 px (export from a 1600×1000 CSS-pixel viewport at 2×) |
| Files required | `<name>-960.webp` (960×600), `<name>-1600.webp` (1600×1000), `<name>-1600.png` (fallback) |
| Naming | lowercase, hyphenated, descriptive: `overview`, `tasks-board`, `shared-group` |
| Content | Real UI with realistic but **non-personal** sample data. No real customer names, no private amounts. |
| Language | Ideally one screenshot per language. If only one exists, use the English UI for both. |

Example for MiDesk:

```
public/images/products/midesk/overview-960.webp
public/images/products/midesk/overview-1600.webp
public/images/products/midesk/overview-1600.png
```

### Logos

SVG, with the artboard tight to the mark, so it works on light (`#f4f2ed`) and dark (`#111210`) backgrounds.

### Social images

`public/og/milabs-en.png` and `public/og/milabs-fa.png`: 1200×630 PNG. They are generated by `npm run assets:brand` (`scripts/generate-brand-assets.mjs`); edit the copy there and re-run.

---

## 5. Swapping a placeholder for a real screenshot

In `app/data/products.ts`, change the product's `visual` from:

```ts
visual: { kind: 'illustration', component: 'MiDeskPreview', provisional: true },
```

to:

```ts
visual: {
  kind: 'image',
  src: '/images/products/midesk/overview',   // no size suffix, no extension
  width: 1600,
  height: 1000,
  provisional: false,                          // false hides the "Illustrative interface" caption
},
```

No component changes are needed. The frame, aspect ratio, reveal animation and hero rotation stay the same.

Then update `visualAlt` in both languages so it describes the actual screenshot.

---

## 6. Enabling the live demo (iframe)

Each product section can open its live product in a dialog on the landing page, so visitors can try it without leaving. The **"Try the live demo"** button only appears once a demo is configured.

In `app/data/products.ts`, add to the product:

```ts
demo: {
  url: { en: 'https://demo.midesk.ir/?lang=en', fa: 'https://demo.midesk.ir/?lang=fa' },
  device: 'desktop',   // 'desktop' → wide browser window, 'mobile' → phone-sized window
},
```

Requirements on the **product side** (the demo will not display without them):

1. **Allow framing by milabs.ir.** The demo response must send `Content-Security-Policy: frame-ancestors https://milabs.ir` and must **not** send `X-Frame-Options: DENY` or `SAMEORIGIN`.
2. **No login wall.** Use a public demo workspace with sample data, reset regularly (for example nightly).
3. **HTTPS only.**
4. **Cookies:** inside an iframe, the demo's cookies are third-party. If the demo needs a session, set cookies with `SameSite=None; Secure; Partitioned`, or keep state in the URL or localStorage.

What the landing page handles:

- The iframe is created only when the dialog opens, and destroyed on close (no background load or cost).
- A loading state shows the filling MiLabs logo. After 9 seconds it offers to open the demo in a new tab.
- Toolbar actions: reload, open in a new tab, and close (Escape and backdrop click also close it).
- The iframe is sandboxed: `allow-scripts allow-same-origin allow-forms allow-popups allow-downloads`.

Test after enabling: `npm run generate && npm run qa`, then open each product's demo in both languages on desktop and mobile.

## 7. Adding a new Mi product

1. Add an entry to the `products` array in `app/data/products.ts`:
   - `id`: lowercase, used for the page anchor (`#mixxx`) and the asset folder
   - `name`: must start with `Mi`
   - `url`: the official product website
   - `status`: `'draft'` (hidden), `'launching'` or `'live'`
   - `accent`: `base` (brand color), `soft` (very light tint for backgrounds), `deep` (dark shade with at least 4.5:1 contrast on white for buttons and small text), `contrast` (text color on `base`)
   - `copy.en` and `copy.fa`: category, tagline, summary, audience, 3–4 capabilities, visualAlt, seo
   - `visual`: an `image` (preferred), or a new coded illustration
2. Add its assets to `public/images/products/<id>/`.
3. Use `status: 'draft'` while preparing; switch to `'launching'` or `'live'` to publish.

The product automatically appears in the hero rotation, the product chapters (alternating layout), the ecosystem diagram, the closing list, the footer and the structured data. The site does not announce upcoming products, so add a product only when it is ready to be shown.

Copy to review when the product count changes:

- `products.title` ("Two products…") in both locale files
- `ecosystem.p1` and `meta.description`, which name the current products
- `hero.lead`

---

## 8. Product links and SEO metadata

- **Product URLs:** `url` in `app/data/products.ts`. All product links (chapters, closing list, footer, structured data) read from it.
- **Page title and description:** `meta.title` and `meta.description` in each locale file.
- **Language entry page (`/`):** `app/data/entry.ts` (shows both languages at once, so it is not in the per-locale files).
- **Domain:** `siteUrl` in `app/data/site.ts`. Canonical URLs, hreflang links, Open Graph URLs and the sitemap all derive from it.
- **Sitemap:** `server/routes/sitemap.xml.ts`. Add new localized paths to `pages` if more pages are added.
- **Product SEO** (`copy.*.seo`) is stored and ready for dedicated product pages if they are added later.

---

## 9. Verifying after changes

```bash
npm run check:locales   # both languages have the same keys, none empty
npm run typecheck       # TypeScript and Vue templates
npm run generate        # static production build into .output/public
npm run qa              # browser QA: screenshots, overflow, hidden content, links, menu, reduced motion
```

`npm run qa` writes full-page screenshots for both languages at 320, 390, 768, 1280, 1440 and 1728 px wide to `qa-output/`. Review them, and especially check:

- screenshots are sharp and not cropped awkwardly in the 16:10 frame
- Persian pages: product names and numbers read correctly inside RTL text
- the "Illustrative interface" caption disappears once `provisional: false` is set
- product links open the correct domain in a new tab

---

## Fonts

| Language | Font | Files |
| --- | --- | --- |
| Persian | **Yekan Bakh FaNum** (Light 300, Regular 400, SemiBold 600, Bold 700, ExtraBold 800). Persian digits are built in. | `public/fonts/yekan-bakh-fanum-*.woff2` |
| English | Instrument Sans, Instrument Serif Italic | `public/fonts/instrument-*.woff2` |
| Labels | Geist Mono | `public/fonts/geist-mono-latin-wght.woff2` |

Yekan Bakh is a **commercial font** (fontiran.com). Make sure the web license covers milabs.ir before publishing. The `@font-face` rules are in `app/assets/css/fonts.css`, and type sizes and line heights per language are in `app/assets/css/tokens.css` (the `:root[dir='rtl']` block).
