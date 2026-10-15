<script setup lang="ts">
import { visibleProducts } from '~/data/products'
import type { SiteLocale } from '~/data/site'
import { dur, ease, stagger } from '~/data/motion'
import type { Formation } from '~/utils/particle-shapes'

/**
 * Hero concept: order out of scattered parts. A field of particles starts
 * scattered, gathers into the shared "Mi", then re-forms into each
 * product's shape (MiDesk: a task board, MiFin: a split ring chart) while
 * the product name rolls into the slot beside the prefix.
 *
 * Without JS or with reduced motion: the first product is shown, the
 * rotation does not autoplay, and the index buttons switch products.
 */
const { t, locale } = useI18n()
const loc = computed(() => locale.value as SiteLocale)

const ROTATE_MS = 5200
// Particle formation per product id; the hero opens on the shared "Mi"
const formations: Record<string, Formation> = { midesk: 'board', mifin: 'ring' }
const particleColors: Record<Formation, string> = {
  mi: '#f1efe9',
  board: visibleProducts.find((p) => p.id === 'midesk')?.accent.soft ?? '#e4e9fd',
  ring: visibleProducts.find((p) => p.id === 'mifin')?.accent.soft ?? '#dcf1e6',
}
const intro = ref(true) // shows "Mi" before the first product
const formation = computed<Formation>(() => (intro.value ? 'mi' : (formations[current.value.key] ?? 'mi')))

const slots = computed(() =>
  visibleProducts.map((p) => ({
    key: p.id,
    suffix: p.name.replace(/^Mi/, ''),
    category: p.copy[loc.value].category,
    accent: p.accent.base,
    product: p,
  })),
)

const active = ref(0)
const playing = ref(false)
const userPaused = ref(false)
const current = computed(() => slots.value[active.value]!)

let timer: ReturnType<typeof setInterval> | null = null
function stop() {
  if (timer) clearInterval(timer)
  timer = null
  playing.value = false
}
function start() {
  stop()
  timer = setInterval(() => {
    if (intro.value) intro.value = false
    else active.value = (active.value + 1) % slots.value.length
  }, ROTATE_MS)
  playing.value = true
}
function select(i: number) {
  intro.value = false
  active.value = i
  if (playing.value) start() // restart the interval so the new slot gets its full time
}
function togglePlay() {
  if (playing.value) { stop(); userPaused.value = true } else { userPaused.value = false; start() }
}

const root = ref<HTMLElement | null>(null)
const machine = ref<HTMLElement | null>(null)
let visibilityObserver: IntersectionObserver | null = null

useMotion(root, ({ gsap, q }, when) => {
  if (!when.motion) return

  const tl = gsap.timeline({ defaults: { ease: ease.reveal } })
  tl.from(q('.hero__eyebrow'), { autoAlpha: 0, x: -16 * dirSign(), duration: dur.settle }, 0.1)
    .from(q('.hero__title .wi'), { opacity: 0, scale: 0.86, filter: 'blur(14px)', duration: 1.2, stagger: { each: stagger.words * 1.3, from: 'start' } }, 0.1)
    .from(q('.hero__lead'), { autoAlpha: 0, y: 18, duration: dur.reveal }, 0.55)
    .from(q('.hero__actions > *'), { autoAlpha: 0, y: 14, duration: dur.settle, stagger: 0.08 }, 0.7)
    // The machine assembles: the panel unmasks, then the prefix, the slot and the interface
    .from(q('.machine__panel'), { clipPath: 'inset(0 0 100% 0 round 18px)', duration: dur.draw, ease: ease.draw }, 0.2)
    .from(q('.machine__name'), { autoAlpha: 0, y: 16, duration: dur.reveal }, 1.1)
    .from(q('.machine__screen'), { y: 60, autoAlpha: 0, duration: dur.reveal }, 1.25)
    .from(q('.machine__index li'), { autoAlpha: 0, y: 10, duration: dur.settle, stagger: 0.07 }, 1.05)

  if (when.desktop) {
    // Gentle depth on scroll: the screen drifts slower than the page
    gsap.to(q('.machine__screen'), {
      yPercent: -8,
      ease: ease.drift,
      scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
    })
  }

  // Autoplay only with motion allowed, and only while the hero is visible
  if (!userPaused.value) start()
  visibilityObserver = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) stop()
    else if (!userPaused.value && !playing.value) start()
  })
  if (machine.value) visibilityObserver.observe(machine.value)

  return () => {
    stop()
    visibilityObserver?.disconnect()
    visibilityObserver = null
  }
}, { afterLoader: true })

function dirSign() {
  return document.documentElement.dir === 'rtl' ? -1 : 1
}

onBeforeUnmount(stop)
</script>

<template>
  <section id="top" ref="root" class="hero" aria-labelledby="hero-title">
    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="eyebrow hero__eyebrow"><span class="hero__tick" aria-hidden="true" />{{ t('hero.eyebrow') }}</p>
        <SplitHeading id="hero-title" as="h1" class="hero__title" :text="t('hero.title')" />
        <p class="lead hero__lead">{{ t('hero.lead') }}</p>
        <div class="hero__actions">
          <ActionLink to="#products" icon="down">{{ t('hero.primary') }}</ActionLink>
          <ActionLink to="#approach" variant="ghost" icon="forward">{{ t('hero.secondary') }}</ActionLink>
        </div>
      </div>

      <div ref="machine" class="machine" :style="{ '--slot-accent': current.accent }">
        <div class="machine__panel">
          <ParticleStage class="machine__particles" :formation="formation" :colors="particleColors">
            <span class="machine__static" dir="ltr">Mi</span>
          </ParticleStage>

          <div class="machine__name" dir="ltr" aria-hidden="true">
            <span class="machine__mi">Mi</span>
            <span class="machine__slot">
              <SlotText :text="current.suffix" />
            </span>
            <span class="machine__cat" :dir="loc === 'fa' ? 'rtl' : 'ltr'">{{ current.category }}</span>
          </div>

          <div class="machine__screen">
            <Transition name="screen">
              <ProductVisual :key="current.key" :product="current.product" :caption="false" decorative eager />
            </Transition>
          </div>
        </div>

        <div class="machine__controls">
          <ul role="list" class="machine__index" :aria-label="t('hero.machineLabel')">
            <li v-for="(s, i) in slots" :key="s.key">
              <button
                type="button"
                class="machine__item"
                :class="{ 'is-active': i === active }"
                :aria-pressed="i === active"
                :style="{ '--item-accent': s.accent }"
                @click="select(i)"
              >
                <span class="machine__num" aria-hidden="true">0{{ i + 1 }}</span>
                <span class="machine__label">
                  <span dir="ltr" class="latin">Mi{{ s.suffix }}</span>
                  <small>{{ s.category }}</small>
                </span>
                <span class="machine__progress" aria-hidden="true">
                  <span
                    v-if="i === active && playing"
                    :key="`${active}-${playing}`"
                    class="machine__progress-fill"
                    :style="{ animationDuration: `${ROTATE_MS}ms` }"
                  />
                </span>
              </button>
            </li>
          </ul>
          <button v-if="playing || userPaused" type="button" class="machine__play" @click="togglePlay">
            <span class="visually-hidden">{{ playing ? t('hero.pause') : t('hero.play') }}</span>
            <svg v-if="playing" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5v9M10 2.5v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
            <svg v-else width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5 11 7l-7 4.5Z" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-block: clamp(2rem, 1rem + 4vw, 5rem) var(--space-9);
  margin-block-start: calc(var(--header-h) * -1);
  padding-block-start: calc(var(--header-h) + clamp(2rem, 1rem + 4vw, 5rem));
  overflow: clip;
}
/* Fine registration grid behind the hero: the "lab" surface */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, #000 0%, transparent 75%);
  opacity: 0.55;
  pointer-events: none;
}
:root[dir='rtl'] .hero::before { mask-image: radial-gradient(ellipse 70% 60% at 30% 40%, #000 0%, transparent 75%); }

.hero__grid {
  position: relative;
  display: grid;
  gap: var(--space-8) var(--grid-gap);
  align-items: center;
}
.hero__copy { display: grid; gap: var(--space-5); justify-items: start; }
.hero__eyebrow { color: var(--fg-soft); }
.hero__tick { width: 1.5rem; height: 1px; background: currentColor; }
.hero__title {
  font-size: var(--fs-display);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-display);
  font-weight: 500;
  max-width: min(100%, 11.5em);
}
:lang(fa) .hero__title { max-width: min(100%, 9.5em); font-weight: 700; }
.hero__title :deep(.serif-accent) { color: var(--c-signal-ink); }
:lang(fa) .hero__title :deep(.serif-accent) { color: var(--c-signal-ink); font-weight: 400; }
.hero__lead { margin-block-start: var(--space-2); }
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4) var(--space-6);
  margin-block-start: var(--space-3);
}

/* ---- Machine ---------------------------------------------------------- */
.machine { display: grid; gap: var(--space-4); min-width: 0; }
.machine__panel {
  position: relative;
  display: grid;
  gap: var(--space-5);
  padding: clamp(1rem, 0.6rem + 1.6vw, 2rem);
  padding-block-end: 0;
  border-radius: var(--radius-l);
  background: var(--c-night);
  color: #f1efe9;
  overflow: hidden;
  isolation: isolate;
}
.machine__panel::after {
  /* Accent glow follows the active product */
  content: '';
  position: absolute;
  inset: auto -10% -40% -10%;
  height: 80%;
  z-index: -1;
  background: radial-gradient(closest-side, var(--slot-accent), transparent);
  opacity: 0.45;
  transition: background 0.8s var(--ease-out);
}
/* Particle field: the shapes of order */
.machine__particles {
  aspect-ratio: 16 / 6.6;
  margin-inline: -4%;
  margin-block: -3% -5%;
  cursor: crosshair;
}
.machine__static {
  display: grid;
  place-items: center;
  height: 100%;
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: clamp(5rem, 3rem + 9vw, 10rem);
  letter-spacing: -0.06em;
  color: #f1efe9;
}

.machine__name {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 0.06em;
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
  line-height: 1.1;
  letter-spacing: -0.045em;
}
.machine__slot { color: var(--slot-accent); filter: brightness(1.45) saturate(0.9); }
.machine__cat {
  margin-inline-start: auto;
  align-self: center;
  font-family: var(--font-sans);
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: 0;
  color: rgb(241 239 233 / 0.7);
}
:lang(fa) .machine__cat { font-family: 'Yekan Bakh', 'Yekan Bakh Fallback', sans-serif; }

/* Fixed 16:10 box: products cross-fade on top of each other, so the layout never shifts */
.machine__screen { position: relative; margin-inline: -2%; aspect-ratio: 16 / 10; }
.machine__screen > :deep(.pv) { position: absolute; inset: 0; }
.machine__screen > :deep(.pv) .pv__frame { height: 100%; aspect-ratio: auto; }
.machine__screen :deep(.pv__frame) {
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.1), 0 -20px 60px -20px rgb(0 0 0 / 0.6);
}

.machine__controls { display: flex; align-items: stretch; gap: var(--space-2); }
.machine__index {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}
.machine__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  width: 100%;
  min-height: 3.5rem;
  padding: 0.7rem 0.75rem 0.85rem;
  border: 0;
  border-radius: var(--radius-s);
  background: transparent;
  text-align: start;
  color: var(--fg-muted);
  box-shadow: inset 0 0 0 1px var(--line);
  transition: color var(--dur-2) var(--ease-out), background-color var(--dur-2) var(--ease-out), box-shadow var(--dur-2);
}
.machine__item.is-active { color: var(--fg); background: var(--bg-raised); box-shadow: inset 0 0 0 1px var(--line-strong); }
@media (hover: hover) {
  .machine__item:not(.is-active):hover { color: var(--fg); box-shadow: inset 0 0 0 1px var(--line-strong); }
}
.machine__num { font-family: var(--font-mono); font-size: 0.6875rem; padding-block-start: 0.2em; }
.machine__label { display: grid; gap: 0.1rem; min-width: 0; font-size: 0.9375rem; font-weight: 600; line-height: 1.25; }
.machine__label small {
  font-size: 0.75rem;
  font-weight: 450;
  color: var(--fg-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.machine__progress { position: absolute; inset-inline: 0.75rem; bottom: 0.45rem; height: 2px; }
.machine__progress-fill {
  display: block;
  height: 100%;
  background: var(--item-accent);
  transform-origin: var(--origin, left);
  animation: progress linear forwards;
}
:root[dir='rtl'] .machine__progress-fill { --origin: right; }
@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.machine__play {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.75rem;
  border: 0;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--fg-soft);
  box-shadow: inset 0 0 0 1px var(--line);
}
@media (hover: hover) { .machine__play:hover { color: var(--fg); box-shadow: inset 0 0 0 1px var(--line-strong); } }

/* ---- Transitions (state changes, kept short) -------------------------- */
.screen-enter-active { transition: transform 0.7s var(--ease-out), opacity 0.5s var(--ease-out), clip-path 0.7s var(--ease-out); }
.screen-leave-active { transition: opacity 0.45s var(--ease-out); z-index: 0; }
.screen-enter-active { z-index: 1; }
.screen-enter-from { transform: translateY(24px); opacity: 0; clip-path: inset(30% 0 0 0); }
.screen-leave-to { opacity: 0; }

@media (min-width: 960px) {
  .hero__grid { grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); min-height: min(52rem, calc(100svh - var(--header-h) - 3rem)); }
}
@media (max-width: 520px) {
  .machine__label small { display: none; }
  .machine__item { min-height: 3rem; }
}
</style>
