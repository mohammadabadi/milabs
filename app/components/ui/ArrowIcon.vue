<script setup lang="ts">
/**
 * Directional arrow. `direction="forward"` points toward reading direction
 * (right in LTR, left in RTL) because it is flipped with --dir-sign.
 * `external` draws a diagonal arrow, which never mirrors.
 */
withDefaults(defineProps<{ direction?: 'forward' | 'down' | 'external' }>(), { direction: 'forward' })
</script>

<template>
  <svg
    class="arrow"
    :class="`arrow--${direction}`"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-if="direction === 'external'"
      d="M5 11 11 5M6 5h5v5"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else
      d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.arrow { flex: none; transition: transform var(--dur-2) var(--ease-out); }
.arrow--forward { transform: scaleX(var(--dir-sign)); }
.arrow--down { transform: rotate(90deg); }
</style>
