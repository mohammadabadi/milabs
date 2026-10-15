<script setup lang="ts">
import type { Product } from '~/data/products'
import type { SiteLocale } from '~/data/site'
import MiDeskPreview from './placeholders/MiDeskPreview.vue'
import MiFinPreview from './placeholders/MiFinPreview.vue'

/**
 * Fixed 16:10 frame for a product visual. Renders a coded interface
 * illustration or a responsive screenshot. Because the frame owns the
 * aspect ratio, replacing an illustration with a screenshot changes
 * neither the layout nor the motion hooks ([data-visual-inner]).
 */
const props = withDefaults(
  defineProps<{ product: Product; caption?: boolean; decorative?: boolean; eager?: boolean }>(),
  { caption: true, decorative: false, eager: false },
)
const { locale, t } = useI18n()
const copy = computed(() => props.product.copy[locale.value as SiteLocale])

const illustrations = { MiDeskPreview, MiFinPreview } as const
const illustration = computed(() =>
  props.product.visual.kind === 'illustration' ? illustrations[props.product.visual.component] : null,
)

/*
 * Illustrations are laid out once at a fixed design size (1000×625 px) and
 * scaled to the frame with a transform. Unlike container-query units this
 * never triggers layout when the page is measured or scrolled, and a
 * transform change cannot cause layout shift. CSS provides a close
 * per-breakpoint estimate before the observer runs.
 */
const frame = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
onMounted(() => {
  if (!frame.value || !illustration.value) return
  observer = new ResizeObserver(([entry]) => {
    const w = entry?.contentRect.width
    if (w) frame.value?.style.setProperty('--pv-scale', String(w / 1000))
  })
  observer.observe(frame.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <figure class="pv" :style="{ '--accent': product.accent.base }">
    <div
      ref="frame"
      class="pv__frame"
      :role="decorative ? undefined : 'img'"
      :aria-label="decorative ? undefined : copy.visualAlt"
      :aria-hidden="decorative ? 'true' : undefined"
    >
      <div class="pv__inner" data-visual-inner>
        <div v-if="illustration" class="pv__stage"><component :is="illustration" /></div>
        <picture v-else-if="product.visual.kind === 'image'">
          <source
            type="image/webp"
            :srcset="`${product.visual.src}-960.webp 960w, ${product.visual.src}-1600.webp 1600w`"
            sizes="(min-width: 960px) 56vw, 92vw"
          />
          <img
            :src="`${product.visual.src}-1600.png`"
            :width="product.visual.width"
            :height="product.visual.height"
            alt=""
            :loading="eager ? 'eager' : 'lazy'"
            decoding="async"
          />
        </picture>
      </div>
    </div>
    <figcaption v-if="caption && product.visual.provisional" class="pv__caption">
      <span class="pv__dot" aria-hidden="true" />{{ t('products.provisional') }}
    </figcaption>
  </figure>
</template>

<style scoped>
.pv { display: grid; gap: var(--space-3); margin: 0; }
.pv__frame {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--radius-m);
  background: #fff;
  box-shadow: 0 0 0 1px rgb(20 20 19 / 0.08), var(--shadow-l);
}
.pv__inner { position: absolute; inset: 0; }
.pv__stage {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  width: 1000px;
  height: 625px;
  transform: scale(var(--pv-scale));
  transform-origin: top left;
}
:root[dir='rtl'] .pv__stage { transform-origin: top right; }
.pv__frame { --pv-scale: 0.34; }
@media (min-width: 420px) { .pv__frame { --pv-scale: 0.4; } }
@media (min-width: 600px) { .pv__frame { --pv-scale: 0.6; } }
@media (min-width: 960px) { .pv__frame { --pv-scale: 0.62; } }
@media (min-width: 1280px) { .pv__frame { --pv-scale: 0.75; } }
.pv__inner :deep(picture),
.pv__inner :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
.pv__caption {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  color: var(--fg-muted);
}
.pv__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid currentColor;
}
</style>
