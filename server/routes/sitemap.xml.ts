import { siteUrl } from '../../app/data/site'

/**
 * XML sitemap, prerendered to /sitemap.xml at build time.
 * Each localized page lists its alternates (including x-default) so the
 * hreflang cluster is declared both in HTML and in the sitemap.
 */
const pages = ['/']
const locales = [
  { code: 'en', hreflang: 'en' },
  { code: 'fa', hreflang: 'fa' },
]

export default defineEventHandler((event) => {
  const lastmod = new Date().toISOString().slice(0, 10)
  const alternates = (path: string) =>
    [
      ...locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${siteUrl}/${l.code}${path}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/"/>`,
    ].join('\n')

  const urls = pages.flatMap((path) =>
    locales.map(
      (l) => `  <url>
    <loc>${siteUrl}/${l.code}${path}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates(path)}
  </url>`,
    ),
  )

  const root = `  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
${alternates('/')}
  </url>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${root}
${urls.join('\n')}
</urlset>
`
})
