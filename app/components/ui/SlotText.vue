<script setup lang="ts">
/**
 * Slot-machine text: when `text` changes, each letter column rolls (the
 * same glyph repeated on the reel, motion-blurred while it spins) and
 * lands on the new letter, left to right. Repeating the final glyph keeps
 * every column exactly as wide as its letter, so nothing clips mid-spin.
 * Decorative only (the real name is in the page content). With reduced
 * motion the text simply swaps.
 */
const props = defineProps<{ text: string }>()

const SPIN = 5 // glyphs passed before landing

interface Column {
  key: string
  reel: string[]
  delay: number
}

const columns = ref<Column[]>([])
const run = ref(0)

function build(text: string, animate: boolean) {
  run.value++
  columns.value = [...text].map((ch, i) => {
    const reel = animate
      ? Array.from({ length: SPIN + i + 1 }, () => ch)
      : [ch]
    return { key: `${run.value}-${i}`, reel, delay: i * 60 }
  })
}

let reduce = true
onMounted(() => {
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
})
build(props.text, false)
watch(
  () => props.text,
  (t) => build(t, !reduce),
)
</script>

<template>
  <span class="slot-text" :aria-label="text">
    <span v-for="c in columns" :key="c.key" class="slot-text__col" aria-hidden="true">
      <span class="slot-text__sizer">{{ c.reel[c.reel.length - 1] }}</span>
      <span
        class="slot-text__reel"
        :class="{ 'is-spinning': c.reel.length > 1 }"
        :style="{ '--steps': c.reel.length - 1, animationDelay: `${c.delay}ms` }"
      >
        <span v-for="(g, i) in c.reel" :key="i">{{ g }}</span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.slot-text { display: inline-flex; }
.slot-text__col {
  position: relative;
  display: inline-block;
  height: 1.1em;
  overflow: hidden;
  /* room for descenders inside the window */
  padding-block-end: 0.05em;
}
.slot-text__sizer { visibility: hidden; display: inline-block; }
.slot-text__reel {
  position: absolute;
  inset-inline: 0;
  top: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.slot-text__reel.is-spinning {
  transform: translateY(calc(var(--steps) * -1.1em));
  animation: reel 0.9s cubic-bezier(0.2, 0.8, 0.25, 1.06) backwards;
}
@keyframes reel {
  from { transform: translateY(0); filter: blur(2px); opacity: 0.4; }
  70% { filter: blur(0); opacity: 1; }
}
</style>
