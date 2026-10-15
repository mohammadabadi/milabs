<script setup lang="ts">
import type { Formation } from '~/utils/particle-shapes'
import { pageReady } from '~/utils/page-ready'

/**
 * Canvas host for the particle field. Purely decorative (aria-hidden).
 * It only starts when motion is allowed and WebGL works; otherwise the
 * static fallback slot is shown. Rendering pauses while off screen or
 * when the tab is hidden.
 */
const props = withDefaults(
  defineProps<{ formation: Formation; colors: Record<Formation, string>; count?: number; size?: number }>(),
  { count: 2600, size: 3.2 },
)

const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
let field: import('~/utils/particle-field').ParticleField | null = null
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let visible = false

function onPointer(e: PointerEvent) {
  if (e.pointerType === 'mouse') field?.setPointer(e.clientX, e.clientY)
}
function onLeave() {
  field?.setPointer(null)
}
function onVisibility() {
  if (document.hidden) field?.stop()
  else if (visible) field?.start()
}

const idle = () =>
  new Promise<void>((r) =>
    'requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 1500 }) : setTimeout(r, 120),
  )

onMounted(async () => {
  if (!canvas.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // The static "Mi" shows meanwhile; particles take over once the page is calm
  await pageReady
  await idle()
  if (!canvas.value) return
  try {
    const { ParticleField } = await import('~/utils/particle-field')
    // Fewer, larger dots on small screens: cheaper and easier to read
    const small = window.innerWidth < 640
    field = new ParticleField(canvas.value, {
      count: small ? Math.round(props.count * 0.55) : props.count,
      colors: props.colors,
      size: small ? props.size * 0.9 : props.size,
    })
  } catch {
    return // no WebGL: the static fallback stays
  }
  field.form(props.formation)
  field.prepare(['board', 'ring', 'mi'])
  ready.value = true

  io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    if (visible && !document.hidden) field?.start()
    else field?.stop()
  })
  io.observe(canvas.value)
  ro = new ResizeObserver(() => field?.resize())
  ro.observe(canvas.value)
  document.addEventListener('visibilitychange', onVisibility)
})

watch(
  () => props.formation,
  (f) => field?.form(f),
)

onBeforeUnmount(() => {
  io?.disconnect()
  ro?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  field?.destroy()
  field = null
})
</script>

<template>
  <div class="stage" :class="{ 'is-ready': ready }" aria-hidden="true" @pointermove="onPointer" @pointerleave="onLeave">
    <canvas ref="canvas" class="stage__canvas" />
    <div class="stage__fallback"><slot /></div>
  </div>
</template>

<style scoped>
.stage { position: relative; }
.stage__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s var(--ease-out);
}
.stage__fallback { position: absolute; inset: 0; transition: opacity 0.5s var(--ease-out); }
.is-ready .stage__canvas { opacity: 1; }
.is-ready .stage__fallback { opacity: 0; pointer-events: none; }
</style>
