<script setup lang="ts">
import type { Product } from '~/data/products'
import { productHost } from '~/data/products'
import type { SiteLocale } from '~/data/site'
import { dur, ease, stagger } from '~/data/motion'
import { formatNumber } from '~/utils/text'

/**
 * One product, presented as an editorial chapter. Layout alternates per
 * index (visual first / copy first). Everything comes from product data;
 * no product-specific code lives here.
 */
const props = defineProps<{ product: Product; index: number; total: number }>()
const { t, locale } = useI18n()
const loc = computed(() => locale.value as SiteLocale)
const copy = computed(() => props.product.copy[loc.value])
const host = computed(() => productHost(props.product))
const num = (n: number) => formatNumber(n, loc.value, { minimumIntegerDigits: 2 })
const flipped = computed(() => props.index % 2 === 1)

const style = computed(() => ({
  '--accent': props.product.accent.base,
  '--accent-soft': props.product.accent.soft,
  '--accent-deep': props.product.accent.deep,
  '--accent-contrast': props.product.accent.contrast,
}))

const root = ref<HTMLElement | null>(null)
useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  const sign = document.documentElement.dir === 'rtl' ? -1 : 1
  const fromSide = (flipped.value ? -1 : 1) * sign

  const tl = gsap.timeline({
    defaults: { ease: ease.reveal },
    scrollTrigger: { trigger: root.value, start: 'top 72%', once: true },
  })
  tl.from(q('.chapter__num'), { autoAlpha: 0, x: -20 * fromSide, duration: dur.reveal }, 0)
    .from(q('.chapter__ch-in'), { yPercent: 120, rotateX: -80, duration: 0.9, stagger: 0.05, ease: 'back.out(1.6)' }, 0.05)
    .from(q('.chapter__tagline .wi'), { opacity: 0, filter: 'blur(10px)', scale: 0.94, duration: dur.reveal, stagger: stagger.words }, 0.3)
    .from(q('.chapter__body > *'), { autoAlpha: 0, y: 22, duration: dur.settle, stagger: stagger.items }, 0.35)
    // The picture assembles tile by tile (PixelReveal), then its UI layers settle
    .from(q('.chapter__visual [data-visual-inner]'), { scale: 1.06, duration: dur.draw + 0.4, ease: ease.reveal }, 0)
    .from(q('.chapter__visual [data-layer]'), { autoAlpha: 0, y: 24, duration: dur.settle, stagger: stagger.layers, ease: ease.settle }, 0.9)

  // Capabilities sit lower on the page: they get their own trigger
  gsap.from(q('.chapter__caps li'), {
    autoAlpha: 0,
    y: 18,
    duration: dur.settle,
    stagger: stagger.items,
    ease: ease.reveal,
    scrollTrigger: { trigger: q('.chapter__caps')[0], start: 'top 85%', once: true },
  })

  if (when.desktop) {
    gsap.fromTo(
      q('.chapter__visual'),
      { yPercent: 6 },
      { yPercent: -6, ease: ease.drift, scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
    gsap.fromTo(
      q('.chapter__ghost'),
      { xPercent: 8 * fromSide },
      { xPercent: -8 * fromSide, ease: ease.drift, scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  }
})
</script>

<template>
  <article
    :id="product.id"
    ref="root"
    class="chapter"
    :class="{ 'is-flipped': flipped }"
    :style="style"
    :aria-labelledby="`${product.id}-name`"
  >
    <span class="chapter__ghost decor" aria-hidden="true" dir="ltr">{{ product.name }}</span>

    <div class="container chapter__grid">
      <header class="chapter__head">
        <p class="chapter__num eyebrow">
          <span class="visually-hidden">{{ t('products.indexLabel', { n: index + 1, total }) }}</span>
          <span aria-hidden="true">{{ num(index + 1) }} / {{ num(total) }}</span>
          <span class="chapter__cat" aria-hidden="true">{{ copy.category }}</span>
        </p>
        <h3 :id="`${product.id}-name`" class="chapter__name" dir="ltr" :aria-label="product.name">
          <span v-for="(ch, i) in product.name" :key="i" class="chapter__ch" :class="{ 'chapter__mi': i < 2 }" aria-hidden="true">
            <span class="chapter__ch-in">{{ ch }}</span>
          </span>
        </h3>
        <SplitHeading as="p" class="chapter__tagline" :text="copy.tagline" />
      </header>

      <div class="chapter__visual">
        <PixelReveal :cols="14" :rows="9">
          <ProductVisual :product="product" />
        </PixelReveal>
      </div>

      <div class="chapter__body">
        <p class="chapter__summary">{{ copy.summary }}</p>
        <div class="chapter__audience">
          <span class="eyebrow">{{ t('products.forWhom') }}</span>
          <p>{{ copy.audience }}</p>
        </div>
        <div class="chapter__cta">
          <ActionLink
            :to="product.url"
            external
            icon="external"
            :aria-label="t('products.visitLabel', { name: product.name })"
          >
            <span dir="ltr">{{ host }}</span>
          </ActionLink>
          <ProductDemo :product="product" />
          <span class="chapter__status" :class="`is-${product.status}`">
            <span class="chapter__status-dot" aria-hidden="true" />{{ t(`products.status.${product.status}`) }}
          </span>
        </div>
      </div>

      <div class="chapter__caps">
        <h4 class="eyebrow">{{ t('products.whatItDoes') }}</h4>
        <ol role="list">
          <li v-for="(c, i) in copy.capabilities" :key="c.title">
            <span class="cap__num" aria-hidden="true">{{ num(i + 1) }}</span>
            <h5 class="cap__title">{{ c.title }}</h5>
            <p class="cap__text">{{ c.text }}</p>
          </li>
        </ol>
      </div>
    </div>
  </article>
</template>

<style scoped>
.chapter {
  position: relative;
  padding-block: var(--space-9);
  overflow: clip;
}
.chapter + :deep(.chapter) { border-top: 1px solid var(--line); }

.chapter__ghost {
  position: absolute;
  inset-block-start: 0.6rem;
  inset-inline-end: -0.06em;
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: var(--fs-giant);
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: var(--accent);
  opacity: 0.06;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.is-flipped .chapter__ghost { inset-inline: -0.06em auto; }

.chapter__grid {
  position: relative;
  display: grid;
  gap: var(--space-7) var(--grid-gap);
  grid-template-areas: 'head' 'visual' 'body' 'caps';
}
.chapter__head { grid-area: head; display: grid; gap: var(--space-4); align-content: start; }
.chapter__visual { grid-area: visual; min-width: 0; }
.chapter__body { grid-area: body; display: grid; gap: var(--space-5); align-content: start; }
.chapter__caps { grid-area: caps; display: grid; gap: var(--space-5); }

.chapter__num { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; color: var(--fg-soft); }
.chapter__cat {
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent-deep);
}

.chapter__name {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-size: clamp(3.5rem, 2rem + 6vw, 7.5rem);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.055em;
  text-align: start;
}
:root[dir='rtl'] .chapter__name { text-align: end; } /* LTR name aligned to the RTL start */
.chapter__ch { display: inline-block; overflow: clip; padding-block: 0.04em 0.1em; perspective: 600px; }
.chapter__ch-in { display: inline-block; transform-origin: 50% 100%; }
.chapter__mi { color: var(--accent); }

.chapter__tagline {
  font-size: var(--fs-h3);
  line-height: var(--lh-sub);
  font-weight: 450;
  max-width: 22ch;
  color: var(--fg);
}
:lang(fa) .chapter__tagline { font-weight: 500; max-width: 18em; }

.chapter__summary { font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--fg-soft); max-width: var(--measure); }
.chapter__audience { display: grid; gap: var(--space-2); padding-inline-start: var(--space-4); border-inline-start: 2px solid var(--accent); }
.chapter__audience p { color: var(--fg); max-width: 32rem; }
.chapter__cta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4) var(--space-5); margin-block-start: var(--space-2); }
.chapter__cta :deep(.action--primary) { --_bg: var(--accent-deep); --_fg: #fff; }
.chapter__cta :deep(.action__wave),
.chapter__cta :deep(.action__wave::before) { --accent: var(--accent); }
.chapter__status { display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--fs-small); color: var(--fg-muted); }
.chapter__status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.is-launching .chapter__status-dot { background: transparent; border: 1.5px solid var(--accent); }

.chapter__caps ol {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--line-strong);
}
.chapter__caps li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-4);
  align-content: start;
  padding: var(--space-5) var(--space-5) var(--space-5) 0;
  border-bottom: 1px solid var(--line);
}
:root[dir='rtl'] .chapter__caps li { padding: var(--space-5) 0 var(--space-5) var(--space-5); }
.cap__num { grid-row: 1 / 3; font-family: var(--font-mono); font-size: var(--fs-label); color: var(--accent-deep); padding-block-start: 0.35em; }
.cap__title { font-size: 1.0625rem; font-weight: 600; line-height: 1.35; }
.cap__text { font-size: var(--fs-small); line-height: var(--lh-body); color: var(--fg-muted); }

@media (min-width: 960px) {
  .chapter__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-areas: none;
    row-gap: var(--space-8);
  }
  .chapter__head { grid-column: 1 / span 5; grid-row: 1; padding-block-start: var(--space-6); }
  .chapter__visual { grid-column: 6 / -1; grid-row: 1 / span 2; margin-inline-end: calc(var(--gutter) * -0.5); }
  .chapter__body { grid-column: 1 / span 5; grid-row: 2; }
  .chapter__caps { grid-column: 1 / -1; grid-row: 3; }
  .chapter__caps ol { border-top: 0; }
  .chapter__caps li { border-bottom: 0; border-top: 1px solid var(--line-strong); padding-inline-end: var(--space-6); }

  .is-flipped .chapter__head { grid-column: 8 / -1; }
  .is-flipped .chapter__body { grid-column: 8 / -1; }
  .is-flipped .chapter__visual { grid-column: 1 / span 7; margin-inline: calc(var(--gutter) * -0.5) 0; }
}
</style>
