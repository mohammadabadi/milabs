<script setup lang="ts">
import { site } from '~/data/site'
import { visibleProducts } from '~/data/products'
import type { SiteLocale } from '~/data/site'

// Served at /en/ and /fa/ (the locale prefix is the whole path).
defineI18nRoute({ paths: { en: '/', fa: '/' } })

const { t, locale } = useI18n()
useSiteSeo('/')

// Structured data: only facts that are true today (name, URL, products).
useHead(() => {
  const loc = locale.value as SiteLocale
  return {
    script: [
      {
        type: 'application/ld+json',
        key: 'ld-org',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${site.url}/#organization`,
              name: site.name,
              url: `${site.url}/`,
              logo: `${site.url}/brand/milabs-symbol-512.png`,
              ...(site.contactEmail ? { email: site.contactEmail } : {}),
              ...(site.social.length ? { sameAs: site.social.map((s) => s.url) } : {}),
            },
            {
              '@type': 'WebSite',
              '@id': `${site.url}/${loc}/#website`,
              url: `${site.url}/${loc}/`,
              name: site.name,
              description: t('meta.description'),
              inLanguage: loc === 'fa' ? 'fa-IR' : 'en',
              publisher: { '@id': `${site.url}/#organization` },
            },
            {
              '@type': 'ItemList',
              name: t('products.eyebrow'),
              itemListElement: visibleProducts.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'SoftwareApplication',
                  name: p.name,
                  url: p.url,
                  description: p.copy[loc].tagline,
                  applicationCategory: p.id === 'mifin' ? 'FinanceApplication' : 'BusinessApplication',
                  publisher: { '@id': `${site.url}/#organization` },
                },
              })),
            },
          ],
        }),
      },
    ],
  }
})
</script>

<template>
  <div>
    <HeroSection />
    <ProductsSection />
    <EcosystemSection />
    <ApproachSection />
    <ClosingSection />
  </div>
</template>
