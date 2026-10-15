<script setup lang="ts">
import { entryCopy } from '~/data/entry'
import { site, type SiteLocale } from '~/data/site'
import { readLocalePreference, rememberLocale } from '~/utils/locale-preference'

const enEntry = entryCopy.en
const faEntry = entryCopy.fa

/**
 * Language entry point at "/". A real page with links to both languages, so
 * crawlers and visitors can always reach either version. It never redirects;
 * a remembered choice only changes which option is highlighted. Both
 * languages are shown side by side, each in its own script and direction.
 */
definePageMeta({ i18n: false, layout: false })

const options = [
  { code: 'fa' as SiteLocale, dir: 'rtl', lang: 'fa-IR', native: 'فارسی', copy: faEntry },
  { code: 'en' as SiteLocale, dir: 'ltr', lang: 'en', native: 'English', copy: enEntry },
]

const preferred = ref<SiteLocale | null>(null)
onMounted(() => { preferred.value = readLocalePreference() })

useHead({
  htmlAttrs: { lang: 'en', dir: 'ltr' },
  title: `${enEntry.title} · ${faEntry.title}`,
  link: [
    { rel: 'canonical', href: `${site.url}/` },
    { rel: 'alternate', hreflang: 'en', href: `${site.url}/en/` },
    { rel: 'alternate', hreflang: 'fa', href: `${site.url}/fa/` },
    { rel: 'alternate', hreflang: 'x-default', href: `${site.url}/` },
  ],
})
useSeoMeta({
  description: `${enEntry.description} ${faEntry.description}`,
  ogType: 'website',
  ogSiteName: site.name,
  ogTitle: enEntry.title,
  ogDescription: enEntry.description,
  ogUrl: `${site.url}/`,
  ogLocale: 'en_US',
  ogLocaleAlternate: ['fa_IR'],
  ogImage: `${site.url}/og/milabs-en.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: enEntry.ogAlt,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <main class="entry">
    <div class="entry__brand">
      <BrandMark :size="36" />
    </div>

    <ul role="list" class="entry__options">
      <li v-for="o in options" :key="o.code" :lang="o.lang" :dir="o.dir" class="entry__option">
        <a :href="`/${o.code}/`" :hreflang="o.code" class="entry__link" @click="rememberLocale(o.code)">
          <span class="entry__native">{{ o.native }}</span>
          <span class="entry__heading">{{ o.copy.heading }}</span>
          <span class="entry__line">{{ o.copy.line }}</span>
          <span class="entry__cta">
            {{ o.copy.cta }}
            <svg class="entry__arrow" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span v-if="preferred === o.code" class="entry__badge">{{ o.copy.lastUsed }}</span>
        </a>
      </li>
    </ul>

    <p class="entry__foot" dir="ltr">MiDesk · MiFin</p>
  </main>
</template>

<style scoped>
.entry {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--space-6);
  padding: var(--gutter);
  background: var(--bg);
}
.entry__brand { padding-block: var(--space-2); }
.entry__options {
  display: grid;
  gap: var(--grid-gap);
  margin: 0;
  align-self: center;
}
.entry__link {
  position: relative;
  display: grid;
  gap: var(--space-3);
  align-content: end;
  min-height: clamp(16rem, 40vh, 26rem);
  padding: clamp(1.5rem, 1rem + 2vw, 3rem);
  border-radius: var(--radius-l);
  background: var(--bg-raised);
  box-shadow: inset 0 0 0 1px var(--line);
  text-decoration: none;
  overflow: hidden;
  isolation: isolate;
  transition: box-shadow var(--dur-2) var(--ease-out), color var(--dur-3) var(--ease-out);
}
.entry__link::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--c-night);
  clip-path: inset(100% 0 0 0);
  transition: clip-path 0.6s var(--ease-out);
}
.entry__native {
  font-size: clamp(3rem, 2rem + 4vw, 6rem);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.04em;
}
[lang='fa-IR'] .entry__native { letter-spacing: 0; font-weight: 700; }
.entry__heading { font-size: var(--fs-lead); font-weight: 500; }
.entry__line { color: var(--fg-muted); transition: color var(--dur-3); }
.entry__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-block-start: var(--space-4);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--c-signal-ink);
  transition: color var(--dur-3);
}
.entry__arrow { transition: transform var(--dur-2) var(--ease-out); }
[dir='rtl'] .entry__arrow { transform: scaleX(-1); }
.entry__badge {
  position: absolute;
  inset-block-start: var(--space-5);
  inset-inline-end: var(--space-5);
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-pill);
  font-size: var(--fs-label);
  background: var(--bg-sunken);
  color: var(--fg-soft);
}
@media (hover: hover) {
  .entry__link:hover { color: #f1efe9; }
  .entry__link:hover::before { clip-path: inset(0 0 0 0); }
  .entry__link:hover .entry__line { color: #a3a29b; }
  .entry__link:hover .entry__cta { color: #ff8a5c; }
  .entry__link:hover .entry__arrow { transform: translateX(4px); }
  [dir='rtl'] .entry__link:hover .entry__arrow { transform: scaleX(-1) translateX(4px); }
}
.entry__foot { font-family: var(--font-mono); font-size: var(--fs-label); color: var(--fg-muted); letter-spacing: 0.08em; }

@media (min-width: 760px) {
  .entry__options { grid-template-columns: 1fr 1fr; }
}
</style>
