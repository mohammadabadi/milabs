<script setup lang="ts">
import { visibleProducts } from '~/data/products'
import type { SiteLocale } from '~/data/site'
import { dur, ease, stagger } from '~/data/motion'

/**
 * "One prefix, separate products." A shared Mi stem with one independent
 * slot per product. The slots are deliberately not connected to each
 * other: shared standard, separate products (no claim of technical
 * integration).
 */
const { t, locale } = useI18n()
const loc = computed(() => locale.value as SiteLocale)
const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  const st = { trigger: q('.eco__diagram')[0], start: 'top 75%', once: true }
  gsap.timeline({ defaults: { ease: ease.reveal }, scrollTrigger: st })
    .from(q('.eco__stem'), { autoAlpha: 0, x: -30 * (document.documentElement.dir === 'rtl' ? -1 : 1), duration: dur.reveal }, 0)
    .from(q('.eco__spine'), { scaleY: 0, transformOrigin: 'top center', duration: dur.draw, ease: ease.draw }, 0.2)
    .from(q('.eco__branch'), { scaleX: 0, duration: dur.settle, stagger: stagger.layers, ease: ease.settle }, 0.6)
    .from(q('.eco__slot'), { autoAlpha: 0, y: 20, duration: dur.settle, stagger: stagger.layers }, 0.75)

  gsap.timeline({
    defaults: { ease: ease.reveal },
    scrollTrigger: { trigger: q('.eco__copy')[0], start: 'top 78%', once: true },
  })
    .from(q('.eco__title .wi'), { opacity: 0, filter: 'blur(12px)', scale: 0.9, duration: 1.1, stagger: stagger.words }, 0)
    .from(q('.eco__text p'), { autoAlpha: 0, y: 18, duration: dur.settle, stagger: 0.12 }, 0.35)

})
</script>

<template>
  <section id="family" ref="root" class="eco on-dark section" aria-labelledby="eco-title">
    <DotWave />
    <div class="container eco__grid">
      <div class="eco__copy">
        <p class="eyebrow">{{ t('ecosystem.eyebrow') }}</p>
        <SplitHeading id="eco-title" class="eco__title" :text="t('ecosystem.title')" />
        <div class="eco__text">
          <p>{{ t('ecosystem.p1') }}</p>
          <p>{{ t('ecosystem.p2') }}</p>
        </div>
      </div>

      <div class="eco__diagram" dir="ltr" aria-hidden="true">
        <div class="eco__stem">Mi</div>
        <div class="eco__tree">
          <span class="eco__spine" />
          <ul role="list" class="eco__slots">
            <li
              v-for="p in visibleProducts"
              :key="p.id"
              class="eco__slot"
              :style="{ '--accent': p.accent.base, '--accent-soft': p.accent.soft }"
            >
              <span class="eco__branch" />
              <span class="eco__slot-box">
                <span class="eco__suffix">{{ p.name.replace(/^Mi/, '') }}</span>
                <span class="eco__cat" :dir="loc === 'fa' ? 'rtl' : 'ltr'" :lang="loc">{{ p.copy[loc].category }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.eco { overflow: clip; isolation: isolate; }
.eco__grid { position: relative; display: grid; gap: var(--space-8) var(--grid-gap); align-items: center; }
.eco__copy { display: grid; gap: var(--space-5); align-content: start; }
.eco__title { font-size: var(--fs-h2); line-height: var(--lh-heading); letter-spacing: var(--tracking-display); max-width: 16ch; }
.eco__title :deep(.serif-accent) { color: #ff8a5c; }
.eco__text { display: grid; gap: var(--space-4); max-width: var(--measure); color: var(--fg-soft); }
.eco__text p:first-child { color: var(--fg); font-size: var(--fs-lead); line-height: var(--lh-lead); }

.eco__diagram {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  min-width: 0;
}
.eco__stem {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: clamp(4.5rem, 2.5rem + 8vw, 10rem);
  line-height: 1;
  letter-spacing: -0.06em;
  color: #f1efe9;
}
.eco__tree { position: relative; padding-inline-start: 1.25rem; }
.eco__spine {
  position: absolute;
  inset-inline-start: 0;
  inset-block: 1.75rem;
  width: 1px;
  background: rgb(241 239 233 / 0.35);
}
.eco__slots { display: grid; gap: var(--space-4); margin: 0; }
.eco__slot { position: relative; display: flex; align-items: center; }
.eco__branch {
  position: absolute;
  inset-inline-start: -1.25rem;
  width: 1.25rem;
  height: 1px;
  background: rgb(241 239 233 / 0.35);
  transform-origin: left center;
}
.eco__slot-box {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-m);
  background: var(--accent-soft);
  color: #141413;
}
.eco__suffix {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.045em;
  color: var(--accent);
  filter: brightness(0.85);
}
.eco__cat { font-size: var(--fs-small); font-weight: 500; color: #34332f; }
</style>
