<script setup lang="ts">
/**
 * MiLabs identity. The symbol is the shared prefix "Mi" followed by an open
 * slot: every product fills that slot with its own name. The wordmark is
 * set in Instrument Sans and always rendered LTR.
 */
withDefaults(defineProps<{ wordmark?: boolean; size?: number }>(), { wordmark: true, size: 28 })
</script>

<template>
  <span class="brand" dir="ltr">
    <svg
      class="brand__symbol"
      :width="size"
      :height="size"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M6.5 22.5V10h2.6l3.4 6.3 3.4-6.3h2.6v12.5h-2.7v-7.6l-2.6 4.7h-1.4l-2.6-4.7v7.6H6.5Z"
        fill="var(--brand-bg, #f4f2ed)"
      />
      <rect x="20.6" y="13.6" width="2.6" height="8.9" fill="var(--brand-bg, #f4f2ed)" />
      <rect x="20.6" y="9.6" width="2.6" height="2.6" fill="var(--c-signal)" />
      <rect x="25.2" y="20.2" width="2.6" height="2.3" fill="var(--brand-bg, #f4f2ed)" opacity="0.55" />
    </svg>
    <span v-if="wordmark" class="brand__word">Mi<span class="brand__labs">Labs</span></span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--fg);
  line-height: 1;
}
.brand__symbol { flex: none; }
.brand__word {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: 1.1875rem;
  letter-spacing: -0.03em;
}
.brand__labs { font-weight: 450; }
</style>
