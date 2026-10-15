<script setup lang="ts">
/**
 * Primary / secondary call to action, always a link.
 * External links open in a new tab with rel="noopener noreferrer" and an
 * accessible hint.
 *
 * Hover: the button fills like the loader's logo, a liquid with a moving
 * wave crest rising from the bottom; on fine pointers the button also leans
 * slightly toward the cursor (magnetic).
 */
const props = withDefaults(
  defineProps<{
    to: string
    variant?: 'primary' | 'secondary' | 'ghost'
    external?: boolean
    icon?: 'forward' | 'down' | 'external' | 'none'
    ariaLabel?: string
  }>(),
  { variant: 'primary', external: false, icon: 'forward' },
)
const { t } = useI18n()
const isHash = computed(() => props.to.startsWith('#'))

// Magnetic pull, mouse only; the transform is reset on leave
const el = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)
function node(): HTMLElement | null {
  const v = el.value as { $el?: HTMLElement } | HTMLElement | null
  return v instanceof HTMLElement ? v : (v?.$el ?? null)
}
function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || props.variant === 'ghost') return
  const n = node()
  if (!n || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = n.getBoundingClientRect()
  const x = (e.clientX - (r.left + r.width / 2)) / r.width
  const y = (e.clientY - (r.top + r.height / 2)) / r.height
  n.style.setProperty('--mx', `${(x * 8).toFixed(2)}px`)
  n.style.setProperty('--my', `${(y * 6).toFixed(2)}px`)
}
function onLeave() {
  const n = node()
  n?.style.setProperty('--mx', '0px')
  n?.style.setProperty('--my', '0px')
}
</script>

<template>
  <a
    v-if="external || isHash"
    ref="el"
    class="action"
    :class="`action--${variant}`"
    :href="to"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-label="ariaLabel"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <span class="action__fill" aria-hidden="true"><span class="action__wave" /></span>
    <span class="action__label"><slot /></span>
    <ArrowIcon v-if="icon !== 'none'" :direction="icon" class="action__icon" />
    <span v-if="external" class="visually-hidden">({{ t('a11y.newTab') }})</span>
  </a>
  <NuxtLink
    v-else
    ref="el"
    class="action"
    :class="`action--${variant}`"
    :to="to"
    :aria-label="ariaLabel"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <span class="action__fill" aria-hidden="true"><span class="action__wave" /></span>
    <span class="action__label"><slot /></span>
    <ArrowIcon v-if="icon !== 'none'" :direction="icon" class="action__icon" />
  </NuxtLink>
</template>

<style scoped>
.action {
  --_bg: var(--fg);
  --_fg: var(--bg);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 3rem;
  padding-inline: 1.35rem 1.15rem;
  border-radius: var(--radius-pill);
  background: var(--_bg);
  color: var(--_fg);
  font-size: 0.9375rem;
  font-weight: 550;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  isolation: isolate;
  overflow: hidden;
  transition-timing-function: var(--ease-out);
}
:lang(fa) .action { font-weight: 600; }

/* Liquid fill: rises from the bottom with a travelling wave crest */
.action__fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}
.action__wave {
  position: absolute;
  inset-inline: -50%;
  top: calc(100% + 10px);
  height: 200%;
  background: var(--accent, var(--c-signal));
  transition: top 0.6s var(--ease-out);
}
.action__wave::before {
  /* the crest: a repeating soft wave on the top edge */
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 100%;
  height: 8px;
  background: radial-gradient(10px 8px at 10px 8px, var(--accent, var(--c-signal)) 98%, transparent) 0 0 / 20px 8px repeat-x;
  animation: crest 1.1s linear infinite;
}
@keyframes crest { to { background-position-x: 20px; } }
.action { translate: var(--mx, 0px) var(--my, 0px); transition-property: color, box-shadow, transform, translate; transition-duration: var(--dur-2), var(--dur-2), var(--dur-1), 0.35s; }

.action--secondary {
  --_bg: transparent;
  --_fg: var(--fg);
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.action--ghost {
  --_bg: transparent;
  --_fg: var(--fg);
  padding-inline: 0;
  min-height: 2.75rem;
  border-radius: 0;
}
.action--ghost .action__fill { display: none; }
.action--ghost .action__label {
  background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 100% 1px;
  transition: background-size var(--dur-3) var(--ease-out);
}
:root[dir='rtl'] .action--ghost .action__label { background-position: 100% 100%; }

@media (hover: hover) {
  .action:hover .action__wave { top: -8px; }
  .action--primary:hover { color: var(--accent-contrast, #fff); }
  .action--secondary:hover { color: var(--accent-contrast, #fff); box-shadow: none; }
  .action:hover .action__icon--forward,
  .action:hover :deep(.arrow--forward) { transform: scaleX(var(--dir-sign)) translateX(3px); }
  .action:hover :deep(.arrow--down) { transform: rotate(90deg) translateX(3px); }
  .action:hover :deep(.arrow--external) { transform: translate(calc(2px * var(--dir-sign, 1)), -2px); }
  .action--ghost:hover .action__label { background-size: 0% 1px; }
}
.action:active { transform: scale(0.98); }
</style>

<style>
@media (prefers-reduced-motion: reduce) {
  .action__wave::before { animation: none; }
}
</style>
