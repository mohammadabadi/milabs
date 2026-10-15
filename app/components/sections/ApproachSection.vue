<script setup lang="ts">
import { dur, ease } from '~/data/motion'
import { formatNumber } from '~/utils/text'

/**
 * Approach / philosophy. An editorial list (not an icon grid). As each
 * principle enters view, a solid bar sweeps across its title in reading
 * direction and uncovers it, like a highlighter putting things in order.
 */
const { t, locale } = useI18n()
const keys = ['focus', 'clarity', 'time', 'improve'] as const
const num = (n: number) => formatNumber(n, locale.value, { minimumIntegerDigits: 2 })

const root = ref<HTMLElement | null>(null)
useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  gsap.from(q('.approach__title .wi'), {
    opacity: 0,
    filter: 'blur(12px)',
    scale: 0.9,
    duration: 1.1,
    ease: ease.reveal,
    stagger: 0.06,
    scrollTrigger: { trigger: q('.approach__title')[0], start: 'top 82%', once: true },
  })
  for (const row of q('.principle')) {
    const parts = (sel: string) => row.querySelectorAll(sel)
    gsap.timeline({ defaults: { ease: ease.reveal }, scrollTrigger: { trigger: row, start: 'top 85%', once: true } })
      .from(parts('.principle__rule'), { scaleX: 0, duration: dur.draw, ease: ease.draw }, 0)
      .from(parts('.principle__num'), { autoAlpha: 0, duration: dur.settle }, 0.2)
      // block wipe: the bar grows over the title, the title appears beneath, the bar leaves
      .set(parts('.principle__title-text'), { opacity: 0 }, 0)
      .fromTo(parts('.principle__bar'), { scaleX: 0, transformOrigin: 'var(--origin) center' }, { scaleX: 1, duration: 0.45, ease: 'power3.in' }, 0.1)
      .set(parts('.principle__title-text'), { opacity: 1 }, 0.55)
      .to(parts('.principle__bar'), { scaleX: 0, transformOrigin: 'var(--origin-end) center', duration: 0.5, ease: 'power3.out' }, 0.56)
      .from(parts('.principle__text'), { autoAlpha: 0, y: 14, duration: dur.reveal }, 0.6)
  }
})
</script>

<template>
  <section id="approach" ref="root" class="approach section" aria-labelledby="approach-title">
    <div class="container approach__grid">
      <div class="approach__head">
        <p class="eyebrow">{{ t('approach.eyebrow') }}</p>
        <SplitHeading id="approach-title" class="approach__title" :text="t('approach.title')" />
      </div>

      <ol role="list" class="approach__list">
        <li v-for="(k, i) in keys" :key="k" class="principle">
          <span class="principle__rule" aria-hidden="true" />
          <span class="principle__num" aria-hidden="true">{{ num(i + 1) }}</span>
          <h3 class="principle__title">
            <span class="principle__title-text">{{ t(`approach.items.${k}.title`) }}</span>
            <span class="principle__bar" aria-hidden="true" />
          </h3>
          <p class="principle__text">{{ t(`approach.items.${k}.text`) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.approach { background: var(--bg); }
.approach__grid { display: grid; gap: var(--space-7) var(--grid-gap); }
.approach__head { display: grid; gap: var(--space-4); align-content: start; }
.approach__title { font-size: var(--fs-h2); line-height: var(--lh-heading); letter-spacing: var(--tracking-display); max-width: 12ch; }
.approach__title :deep(.serif-accent) { color: var(--c-signal-ink); }

.approach__list { margin: 0; display: grid; }
.principle {
  --origin: left;
  position: relative;
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-2) var(--space-4);
  padding-block: var(--space-6);
}
:root[dir='rtl'] .principle { --origin: right; }
.principle__rule {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1px;
  background: var(--line-strong);
  transform-origin: var(--origin) center;
}
.principle__title { position: relative; justify-self: start; }
.principle__bar {
  position: absolute;
  inset: 0.08em -0.15em;
  background: var(--c-signal);
  transform: scaleX(0);
  pointer-events: none;
}
.principle { --origin-end: right; }
:root[dir='rtl'] .principle { --origin-end: left; }
.principle__num { font-family: var(--font-mono); font-size: var(--fs-label); color: var(--fg-muted); padding-block-start: 0.65em; }
.principle__title {
  font-size: var(--fs-h3);
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: var(--tracking-heading);
}
:lang(fa) .principle__title { line-height: var(--lh-sub); font-weight: 700; }
.principle__text { grid-column: 2; color: var(--fg-muted); max-width: 34rem; }

@media (min-width: 960px) {
  .approach__grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .approach__head { grid-column: 1 / span 4; position: sticky; top: calc(var(--header-h) + 2rem); align-self: start; }
  .approach__list { grid-column: 6 / -1; }
  .principle { grid-template-columns: 4rem minmax(0, 1fr) minmax(0, 1.1fr); column-gap: var(--space-6); }
  .principle__text { grid-column: 3; padding-block-start: 0.35em; }
}
</style>
