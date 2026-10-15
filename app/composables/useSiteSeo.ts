import { locales, ogLocale, site, type SiteLocale } from '~/data/site'

/**
 * Head metadata for a localized page. Written explicitly (rather than with
 * useLocaleHead) so that `x-default` points to the language entry page at
 * "/" instead of one of the localized versions.
 *
 * @param path Path after the locale prefix, e.g. "/" for the homepage.
 */
export function useSiteSeo(path = '/') {
  const { t, locale } = useI18n()

  const urlFor = (code: SiteLocale) => `${site.url}/${code}${path === '/' ? '/' : path}`

  useHead(() => {
    const code = locale.value as SiteLocale
    const dir = code === 'fa' ? 'rtl' : 'ltr'
    const canonical = urlFor(code)
    return {
      htmlAttrs: { lang: code === 'fa' ? 'fa-IR' : 'en', dir },
      title: t('meta.title'),
      link: [
        // Preload the faces used above the fold, per language
        ...(code === 'fa'
          ? ['/fonts/yekan-bakh-fanum-400.woff2', '/fonts/yekan-bakh-fanum-700.woff2']
          : ['/fonts/instrument-sans-latin-wght.woff2', '/fonts/instrument-serif-latin-italic.woff2']
        ).map((href) => ({ rel: 'preload' as const, as: 'font' as const, type: 'font/woff2', href, crossorigin: '' as const })),
        { rel: 'canonical' as const, href: canonical },
        ...locales.map((l) => ({
          rel: 'alternate' as const,
          hreflang: l === 'fa' ? 'fa' : 'en',
          href: urlFor(l),
        })),
        { rel: 'alternate' as const, hreflang: 'x-default', href: `${site.url}/` },
      ],
    }
  })

  useSeoMeta({
    description: () => t('meta.description'),
    ogType: 'website',
    ogSiteName: site.name,
    ogTitle: () => t('meta.title'),
    ogDescription: () => t('meta.description'),
    ogUrl: () => urlFor(locale.value as SiteLocale),
    ogLocale: () => ogLocale[locale.value as SiteLocale],
    ogLocaleAlternate: () => locales.filter((l) => l !== locale.value).map((l) => ogLocale[l]),
    ogImage: () => `${site.url}/og/milabs-${locale.value}.png`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: () => t('meta.ogAlt'),
    twitterCard: 'summary_large_image',
    twitterTitle: () => t('meta.title'),
    twitterDescription: () => t('meta.description'),
    twitterImage: () => `${site.url}/og/milabs-${locale.value}.png`,
  })
}
