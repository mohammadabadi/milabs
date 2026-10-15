<script setup lang="ts">
/**
 * Mosaic reveal: a grid of paper-colored tiles covers the content and
 * clears tile by tile in random order when the element scrolls into view,
 * so the product picture "assembles" piece by piece.
 *
 * The tiles are decorative and only created when motion is allowed; with
 * reduced motion or no JavaScript the content is simply visible.
 */
const props = withDefaults(defineProps<{ cols?: number; rows?: number; color?: string; duration?: number }>(), {
  cols: 16,
  rows: 10,
  color: 'var(--bg)',
  duration: 1.1,
})

const root = ref<HTMLElement | null>(null)
const active = ref(false)
const order = ref<number[]>([])

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const n = props.cols * props.rows
  // Random order, biased so the reveal sweeps from the reading-start side
  const rtl = document.documentElement.dir === 'rtl'
  order.value = Array.from({ length: n }, (_, i) => {
    const col = i % props.cols
    const sweep = (rtl ? props.cols - 1 - col : col) / props.cols
    return sweep * 0.55 + Math.random() * 0.45
  })
  active.value = true
})

useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return
  const tiles = q('.px__tile')
  gsap.set(tiles, { opacity: 1 })
  gsap.to(tiles, {
    opacity: 0,
    duration: 0.18,
    ease: 'none',
    delay: (i: number) => (order.value[i] ?? 0) * props.duration,
    scrollTrigger: { trigger: root.value, start: 'top 78%', once: true },
  })
})
</script>

<template>
  <div ref="root" class="px">
    <slot />
    <div
      v-if="active"
      class="px__grid"
      aria-hidden="true"
      :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }"
    >
      <span v-for="i in cols * rows" :key="i" class="px__tile" :style="{ background: color }" />
    </div>
  </div>
</template>

<style scoped>
.px { position: relative; }
.px__grid {
  position: absolute;
  inset: -1px;
  display: grid;
  pointer-events: none;
  z-index: 2;
}
/* Tiles start transparent: if the animation never runs, nothing is hidden */
.px__tile { opacity: 0; margin: -0.5px; }
</style>
