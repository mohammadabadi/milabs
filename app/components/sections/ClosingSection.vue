<script setup lang="ts">
import { visibleProducts, productHost } from '~/data/products'
import type { SiteLocale } from '~/data/site'
import { dur, ease, stagger } from '~/data/motion'

/**
 * Closing invitation. One large row per product: the entire row is the
 * link. On hover the row fills with the product accent from the reading
 * start edge; on touch it is simply a big, clear target.
 */
const { t, locale } = useI18n()
const loc = computed(() => locale.value as SiteLocale)
const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  gsap.timeline({ defaults: { ease: ease.reveal }, scrollTrigger: { trigger: root.value, start: 'top 70%', once: true } })
    .from(q('.closing__title .wi'), { yPercent: 110, duration: dur.reveal, stagger: stagger.words }, 0)
    .from(q('.row'), { autoAlpha: 0, y: 30, duration: dur.reveal, stagger: stagger.layers }, 0.25)
    .from(q('.row__name'), { xPercent: -6 * (document.documentElement.dir === 'rtl' ? -1 : 1), duration: dur.reveal * 1.2, stagger: stagger.layers }, 0.25)
})
</script>

<template>
  <section id="start" ref="root" class="closing section" aria-labelledby="closing-title">
    <div class="container">
      <p class="eyebrow">{{ t('closing.eyebrow') }}</p>
      <SplitHeading id="closing-title" class="closing__title" :text="t('closing.title')" />

      <ul role="list" class="closing__rows">
        <li v-for="p in visibleProducts" :key="p.id">
          <a
            class="row"
            :href="p.url"
            target="_blank"
            rel="noopener noreferrer"
            :style="{ '--accent': p.accent.base, '--accent-deep': p.accent.deep }"
          >
            <span class="row__name" dir="ltr"><span class="row__mi">Mi</span>{{ p.name.replace(/^Mi/, '') }}</span>
            <span class="row__line">{{ p.copy[loc].tagline }}</span>
            <span class="row__host"><span dir="ltr">{{ productHost(p) }}</span><ArrowIcon direction="external" /></span>
            <span class="visually-hidden">({{ t('a11y.newTab') }})</span>
          </a>
        </li>
      </ul>
      <p class="closing__note">{{ t('closing.note') }}</p>
    </div>
  </section>
</template>

<style scoped>
.closing { background: var(--bg-sunken); padding-block-end: var(--space-8); }
.closing__title {
  font-size: var(--fs-h2);
  line-height: var(--lh-heading);
  letter-spacing: var(--tracking-display);
  max-width: 18ch;
  margin-block: var(--space-4) var(--space-7);
}
.closing__title :deep(.serif-accent) { color: var(--c-signal-ink); }

.closing__rows { margin: 0; border-top: 1px solid var(--line-strong); }
.row {
  --origin: left;
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2) var(--space-6);
  align-items: center;
  padding: var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--line-strong);
  text-decoration: none;
  color: var(--fg);
  isolation: isolate;
  overflow: hidden;
}
:root[dir='rtl'] .row { --origin: right; }
a.row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--accent-deep);
  transform: scaleX(0);
  transform-origin: var(--origin) center;
  transition: transform 0.6s var(--ease-out);
}
.row__name {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-size: clamp(2.75rem, 1.5rem + 5vw, 6rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.055em;
  justify-self: start;
  transition: color var(--dur-3) var(--ease-out), transform 0.6s var(--ease-out);
}
.row__mi { color: var(--accent); transition: color var(--dur-3) var(--ease-out); }
.row__line { color: var(--fg-soft); max-width: 30rem; transition: color var(--dur-3) var(--ease-out); }
.row__host {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  transition: color var(--dur-3) var(--ease-out);
}

@media (hover: hover) {
  a.row:hover::before { transform: scaleX(1); }
  a.row:hover .row__name,
  a.row:hover .row__line,
  a.row:hover .row__host,
  a.row:hover .row__mi { color: #fff; }
  a.row:hover .row__name { transform: translateX(calc(0.6rem * var(--dir-sign))); }
  a.row:hover :deep(.arrow--external) { transform: translate(calc(2px * var(--dir-sign)), -2px); }
}
a.row:focus-visible { outline-offset: -2px; }

.closing__note { margin-block-start: var(--space-5); font-size: var(--fs-small); color: var(--fg-muted); }

@media (min-width: 760px) {
  .row { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto; padding-inline: var(--space-4); }
}
</style>
