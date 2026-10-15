<script setup lang="ts">
import { loadGsap } from '~/composables/useMotion'
import { markPageReady } from '~/utils/page-ready'

/**
 * First-load screen: the MiLabs symbol fills up as the page actually gets
 * ready, then the screen lifts away and the page intro begins.
 *
 * Fill stages follow real milestones, not a fake timer:
 *   server HTML painted → creeping fill (CSS only, before hydration)
 *   app hydrated        → 70%
 *   web fonts ready     → 85%
 *   window load + animation library ready → 100%
 *
 * Safety: the loader only exists when JavaScript runs (html.js), and an
 * inline head script removes it after 8 s no matter what, so the page can
 * never get stuck behind it. Repeat visits in the same session skip the
 * minimum display time.
 */
const { t } = useI18n()

const progress = ref<number | null>(0)
const booting = ref(true)
const leaving = ref(false)
const gone = ref(false)

const MIN_FIRST_VISIT_MS = 700
const EXIT_MS = 650

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const windowLoaded = () =>
  document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r, { once: true }))

function seenThisSession() {
  try {
    const seen = sessionStorage.getItem('milabs-loaded') === '1'
    sessionStorage.setItem('milabs-loaded', '1')
    return seen
  } catch {
    return false
  }
}

onMounted(async () => {
  const html = document.documentElement
  if (html.classList.contains('loader-timeout')) {
    finish()
    return
  }
  const started = performance.timeOrigin ? performance.now() : 0
  const minTime = seenThisSession() ? 0 : MIN_FIRST_VISIT_MS

  booting.value = false
  progress.value = 0.7
  await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(3000)])
  progress.value = 0.85
  await Promise.race([Promise.all([windowLoaded(), loadGsap()]), wait(5000)])
  progress.value = 1

  // Let the fill and the dot land, and respect the minimum first-visit time
  await wait(Math.max(300, minTime - (performance.now() - started)))
  leaving.value = true
  html.classList.remove('is-loading')
  // The intro starts while the loader lifts, so the two motions overlap
  markPageReady()
  await wait(EXIT_MS)
  finish()
})

function finish() {
  gone.value = true
  document.documentElement.classList.remove('is-loading')
  markPageReady()
  // Language switches carry a section anchor: land on it now that the page is free
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
}
</script>

<template>
  <div
    v-if="!gone"
    class="loader"
    :class="{ 'is-booting': booting, 'is-leaving': leaving, 'is-full': progress === 1 }"
    role="status"
    aria-live="polite"
  >
    <div class="loader__mark">
      <BrandLoader :progress="progress" :size="84" />
    </div>
    <span class="loader__word" dir="ltr" aria-hidden="true">Mi<span>Labs</span></span>
    <span class="visually-hidden">{{ t('loader.label') }}</span>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  place-content: center;
  justify-items: center;
  gap: 1.25rem;
  background: var(--c-paper);
  color: var(--c-ink);
}

.loader__word {
  font-family: 'Instrument Sans Variable', 'Instrument Sans Fallback', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
}
.loader__word span { font-weight: 450; }
.is-full .loader__word { opacity: 1; transform: none; }

/* Before hydration the fill creeps up with CSS only */
.is-booting :deep(.bl__fill) { animation: creep 2.6s cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
@keyframes creep {
  from { transform: translateY(32px); }
  to { transform: translateY(12px); }
}

.loader__mark { transition: transform 0.7s var(--ease-out); }
.is-full .loader__mark { transform: scale(1.04); }

/* Exit: the paper lifts from the bottom edge, revealing the page */
.is-leaving {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.65s cubic-bezier(0.76, 0, 0.24, 1);
}
.is-leaving .loader__mark,
.is-leaving .loader__word {
  transform: translateY(-24px);
  opacity: 0;
  transition: transform 0.6s var(--ease-in-out), opacity 0.45s var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .is-booting :deep(.bl__fill) { animation: none; transform: translateY(12px); }
  .is-leaving { clip-path: none; opacity: 0; transition: opacity 0.3s linear; }
}
</style>

<style>
/* Only with JavaScript, and never after the failsafe timeout */
html.js:not(.loader-timeout) .loader { display: grid; }
html.js.is-loading:not(.loader-timeout) { overflow: hidden; }
</style>
