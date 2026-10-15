<script setup lang="ts">
import { visibleProducts } from '~/data/products'
import { dur, ease, stagger } from '~/data/motion'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  gsap.timeline({
    defaults: { ease: ease.reveal },
    scrollTrigger: { trigger: q('.products__intro')[0], start: 'top 80%', once: true },
  })
    .from(q('.products__rule'), { scaleX: 0, transformOrigin: 'var(--origin) center', duration: dur.draw, ease: ease.draw }, 0)
    .from(q('.products__intro .eyebrow'), { autoAlpha: 0, duration: dur.settle }, 0.1)
    .from(q('.products__title .wi'), { yPercent: 110, duration: dur.reveal, stagger: stagger.words }, 0.1)
    .from(q('.products__lead'), { autoAlpha: 0, y: 16, duration: dur.reveal }, 0.4)
})
</script>

<template>
  <section id="products" ref="root" class="products" aria-labelledby="products-title">
    <div class="container products__intro">
      <span class="products__rule" aria-hidden="true" />
      <p class="eyebrow">{{ t('products.eyebrow') }}</p>
      <SplitHeading id="products-title" class="products__title" :text="t('products.title')" />
      <p class="lead products__lead">{{ t('products.intro') }}</p>
    </div>

    <ProductChapter
      v-for="(p, i) in visibleProducts"
      :key="p.id"
      :product="p"
      :index="i"
      :total="visibleProducts.length"
    />
  </section>
</template>

<style scoped>
.products { padding-block-start: var(--section-pad); }
.products__intro {
  --origin: left;
  display: grid;
  gap: var(--space-4) var(--grid-gap);
  align-items: end;
}
:root[dir='rtl'] .products__intro { --origin: right; }
.products__rule { display: block; height: 1px; background: var(--line-strong); margin-block-end: var(--space-5); grid-column: 1 / -1; }
.products__title { font-size: var(--fs-h2); line-height: var(--lh-heading); letter-spacing: var(--tracking-display); max-width: 15ch; }
.products__title :deep(.serif-accent) { color: var(--c-signal-ink); }
@media (min-width: 960px) {
  .products__intro { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .products__intro .eyebrow { grid-column: 1 / -1; }
  .products__title { grid-column: 1 / span 7; }
  .products__lead { grid-column: 9 / -1; padding-block-end: 0.6em; }
}
</style>
