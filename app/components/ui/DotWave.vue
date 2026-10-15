<script setup lang="ts">
/**
 * Dot-matrix wave background (Canvas 2D). A grid of dots swells and
 * brightens along a slow travelling wave; near the pointer the dots lift
 * a little more. Decorative, paused off screen, skipped with reduced
 * motion (a static, faint grid is drawn instead).
 */
const props = withDefaults(defineProps<{ color?: string; accent?: string; gap?: number }>(), {
  color: '241, 239, 233',
  accent: '242, 84, 27',
  gap: 22,
})

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let running = false
let w = 0
let h = 0
let dpr = 1
const pointer = { x: -9999, y: -9999 }
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let reduce = false

function resize() {
  const c = canvas.value
  if (!c) return
  const r = c.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = r.width
  h = r.height
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (reduce) draw(0)
}

function draw(t: number) {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  const g = props.gap
  const rtl = document.documentElement.dir === 'rtl' ? -1 : 1
  for (let y = g / 2; y < h; y += g) {
    for (let x = g / 2; x < w; x += g) {
      // wave travels in reading direction, gently curved
      const u = (x / w) * rtl
      const wave = Math.sin(u * 7 - t * 0.9 + Math.sin(y / h * 3 + t * 0.3) * 1.4)
      const crest = Math.max(0, wave) ** 3
      const dx = x - pointer.x
      const dy = y - pointer.y
      const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160)
      const r = 0.7 + crest * 1.5 + near * 1.6
      const a = 0.1 + crest * 0.35 + near * 0.5
      ctx.fillStyle = near > 0.35 ? `rgba(${props.accent}, ${a})` : `rgba(${props.color}, ${a})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function loop(now: number) {
  if (!running) return
  draw(now / 1000)
  raf = requestAnimationFrame(loop)
}
function start() {
  if (running || reduce) return
  running = true
  raf = requestAnimationFrame(loop)
}
function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function onMove(e: PointerEvent) {
  const r = canvas.value!.getBoundingClientRect()
  pointer.x = e.clientX - r.left
  pointer.y = e.clientY - r.top
}
function onLeave() {
  pointer.x = pointer.y = -9999
}

onMounted(() => {
  if (!canvas.value) return
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  ctx = canvas.value.getContext('2d')
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value)
  io = new IntersectionObserver(([e]) => (e?.isIntersecting ? start() : stop()))
  io.observe(canvas.value)
  const host = canvas.value.parentElement
  host?.addEventListener('pointermove', onMove, { passive: true })
  host?.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  stop()
  io?.disconnect()
  ro?.disconnect()
  const host = canvas.value?.parentElement
  host?.removeEventListener('pointermove', onMove)
  host?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <canvas ref="canvas" class="dotwave decor" aria-hidden="true" />
</template>

<style scoped>
.dotwave {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 85% 75% at 70% 50%, #000 30%, transparent 85%);
}
:root[dir='rtl'] .dotwave { mask-image: radial-gradient(ellipse 85% 75% at 30% 50%, #000 30%, transparent 85%); }
</style>
