<script setup lang="ts">
/**
 * The MiLabs symbol filling up: the square fills from the bottom with ink
 * while the "Mi." glyphs are knocked out of it. `progress` (0–1) drives the
 * fill level; without it, the mark fills in a loop (indeterminate).
 * Used by the page loader and inside the demo dialog.
 */
const props = withDefaults(defineProps<{ progress?: number | null; size?: number; accent?: string }>(), {
  progress: null,
  size: 72,
  accent: 'var(--c-signal)',
})
const uid = useId()
const level = computed(() => (props.progress == null ? null : Math.min(1, Math.max(0, props.progress))))
</script>

<template>
  <svg
    class="bl"
    :class="{ 'is-indeterminate': level === null }"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    aria-hidden="true"
    focusable="false"
    :style="{ '--bl-accent': accent, '--bl-level': level ?? 0 }"
  >
    <defs>
      <clipPath :id="`${uid}-c`"><rect width="32" height="32" rx="7" /></clipPath>
      <mask :id="`${uid}-m`">
        <rect width="32" height="32" fill="#fff" />
        <path d="M6.5 22.5V10h2.6l3.4 6.3 3.4-6.3h2.6v12.5h-2.7v-7.6l-2.6 4.7h-1.4l-2.6-4.7v7.6H6.5Z" fill="#000" />
        <rect x="20.6" y="13.6" width="2.6" height="8.9" fill="#000" />
      </mask>
    </defs>
    <!-- empty outline -->
    <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="6.4" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.5" />
    <!-- liquid fill, rising from the bottom -->
    <g :clip-path="`url(#${uid}-c)`" :mask="`url(#${uid}-m)`">
      <g class="bl__fill">
        <path class="bl__wave" d="M-32 2 Q-24 0 -16 2 T0 2 T16 2 T32 2 T48 2 V40 H-32 Z" fill="currentColor" />
      </g>
    </g>
    <!-- the dot is the accent, and lands last -->
    <rect class="bl__dot" x="20.6" y="9.6" width="2.6" height="2.6" fill="var(--bl-accent)" />
  </svg>
</template>

<style scoped>
.bl { display: block; color: var(--c-ink); overflow: visible; }
.bl__fill {
  transform: translateY(calc(32px - var(--bl-level) * 34px));
  transition: transform 0.6s var(--ease-out);
}
.bl__wave { animation: wave 1.6s linear infinite; }
@keyframes wave { to { transform: translateX(16px); } }
.bl__dot {
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(calc(var(--bl-level) * 1.6 - 0.6));
  transition: transform 0.5s var(--ease-spring);
}
.is-indeterminate .bl__fill { animation: rise 2.4s var(--ease-in-out) infinite; transition: none; }
.is-indeterminate .bl__dot { animation: dot 2.4s var(--ease-in-out) infinite; transition: none; }
@keyframes rise {
  0% { transform: translateY(32px); }
  70%, 100% { transform: translateY(-2px); }
}
@keyframes dot {
  0%, 60% { transform: scale(0); }
  75%, 100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .bl__wave, .is-indeterminate .bl__fill, .is-indeterminate .bl__dot { animation: none; }
  .is-indeterminate .bl__fill { transform: translateY(-2px); }
  .is-indeterminate .bl__dot { transform: none; }
}
</style>
