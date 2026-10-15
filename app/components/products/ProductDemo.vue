<script setup lang="ts">
import type { Product } from '~/data/products'
import type { SiteLocale } from '~/data/site'

/**
 * Live product demo in a modal <dialog>. The iframe is only created when
 * the dialog opens (nothing is downloaded before), and it is removed on
 * close so the demo does not keep running in the background.
 *
 * Native <dialog> gives focus trapping, Escape to close and an inert page
 * behind it. If the demo cannot be framed or is slow, the visitor can
 * always open it in a new tab.
 */
const props = defineProps<{ product: Product }>()
const { t, locale } = useI18n()

const dialog = ref<HTMLDialogElement | null>(null)
const opener = ref<HTMLButtonElement | null>(null)
const open = ref(false)
const state = ref<'loading' | 'ready' | 'slow'>('loading')
const reloadKey = ref(0)
let slowTimer: ReturnType<typeof setTimeout> | null = null

const url = computed(() => props.product.demo?.url[locale.value as SiteLocale] ?? '')
const host = computed(() => (url.value ? new URL(url.value).host : ''))
const device = computed(() => props.product.demo?.device ?? 'desktop')

function startLoading() {
  state.value = 'loading'
  if (slowTimer) clearTimeout(slowTimer)
  slowTimer = setTimeout(() => {
    if (state.value === 'loading') state.value = 'slow'
  }, 9000)
}

function show() {
  if (!dialog.value) return
  open.value = true
  startLoading()
  dialog.value.showModal()
  document.documentElement.classList.add('demo-open')
}

function close() {
  dialog.value?.close()
}

function onClose() {
  open.value = false
  if (slowTimer) clearTimeout(slowTimer)
  document.documentElement.classList.remove('demo-open')
  opener.value?.focus()
}

function reload() {
  reloadKey.value++
  startLoading()
}

function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) close()
}

onBeforeUnmount(() => {
  if (slowTimer) clearTimeout(slowTimer)
  document.documentElement.classList.remove('demo-open')
})
</script>

<template>
  <div v-if="product.demo" class="demo" :style="{ '--accent': product.accent.base, '--accent-deep': product.accent.deep }">
    <button
      ref="opener"
      type="button"
      class="demo__open"
      :aria-label="t('demo.openLabel', { name: product.name })"
      aria-haspopup="dialog"
      @click="show"
    >
      <span class="demo__pulse" aria-hidden="true" />
      {{ t('demo.open') }}
    </button>

    <dialog
      ref="dialog"
      class="demo__dialog"
      :class="`is-${device}`"
      :aria-label="t('demo.title', { name: product.name })"
      @close="onClose"
      @click="onBackdrop"
    >
      <div class="demo__window">
        <header class="demo__bar">
          <span class="demo__dots" aria-hidden="true"><i /><i /><i /></span>
          <span class="demo__address" dir="ltr">
            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="5.5" width="7" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.2" /></svg>
            {{ host }}
          </span>
          <div class="demo__actions">
            <button type="button" class="demo__icon" :title="t('demo.reload')" @click="reload">
              <span class="visually-hidden">{{ t('demo.reload') }}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.55M13 2.5v2.5h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <a :href="url" target="_blank" rel="noopener noreferrer" class="demo__icon" :title="t('demo.openNew')">
              <span class="visually-hidden">{{ t('demo.openNew') }} ({{ t('a11y.newTab') }})</span>
              <ArrowIcon direction="external" />
            </a>
            <button type="button" class="demo__icon demo__close" @click="close">
              <span class="visually-hidden">{{ t('demo.close') }}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </button>
          </div>
        </header>

        <div class="demo__stage">
          <iframe
            v-if="open"
            :key="reloadKey"
            class="demo__frame"
            :class="{ 'is-ready': state === 'ready' }"
            :src="url"
            :title="t('demo.title', { name: product.name })"
            allow="clipboard-write; fullscreen"
            referrerpolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            @load="state = 'ready'"
          />
          <Transition name="fade">
            <div v-if="state !== 'ready'" class="demo__status" role="status">
              <BrandLoader :accent="product.accent.base" :size="56" />
              <p>{{ state === 'slow' ? t('demo.slow') : t('demo.loading') }}</p>
              <a v-if="state === 'slow'" :href="url" target="_blank" rel="noopener noreferrer" class="demo__fallback">
                {{ t('demo.openNew') }} <ArrowIcon direction="external" />
              </a>
            </div>
          </Transition>
        </div>

        <footer class="demo__foot">{{ t('demo.note') }}</footer>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.demo__open {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 3rem;
  padding-inline: 1.2rem;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--accent-deep);
  box-shadow: inset 0 0 0 1.5px var(--accent);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background-color var(--dur-2) var(--ease-out), color var(--dur-2) var(--ease-out);
}
@media (hover: hover) {
  .demo__open:hover { background: var(--accent); color: #fff; }
  .demo__open:hover .demo__pulse { background: #fff; }
}
.demo__pulse {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.demo__pulse::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  animation: pulse 1.8s var(--ease-out) infinite;
}
@keyframes pulse { from { transform: scale(0.6); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }

/* ---- Dialog ---------------------------------------------------------- */
.demo__dialog {
  width: min(100% - 2rem, 76rem);
  height: min(100% - 2rem, 50rem);
  max-width: none;
  max-height: none;
  padding: 0;
  border: 0;
  border-radius: var(--radius-l);
  background: transparent;
  overflow: visible;
}
.demo__dialog.is-mobile { width: min(100% - 2rem, 26rem); height: min(100% - 2rem, 52rem); }
.demo__dialog::backdrop {
  background: rgb(17 18 16 / 0.72);
  backdrop-filter: blur(6px);
}
.demo__dialog[open] { animation: dialog-in 0.5s var(--ease-out); }
.demo__dialog[open]::backdrop { animation: fade-in 0.4s var(--ease-out); }
@keyframes dialog-in { from { opacity: 0; transform: translateY(24px) scale(0.98); } }
@keyframes fade-in { from { opacity: 0; } }

.demo__window {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  border-radius: var(--radius-l);
  background: var(--c-night);
  color: #f1efe9;
  overflow: hidden;
  box-shadow: 0 40px 120px -20px rgb(0 0 0 / 0.6);
}
.demo__bar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-4);
  padding: 0.6rem 0.75rem 0.6rem 1rem;
}
.demo__dots { display: flex; gap: 6px; direction: ltr; }
.demo__dots i { width: 10px; height: 10px; border-radius: 50%; background: rgb(241 239 233 / 0.18); }
.demo__address {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  max-width: 100%;
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-pill);
  background: rgb(241 239 233 / 0.08);
  font-family: 'Geist Mono Variable', ui-monospace, monospace;
  font-size: 0.8125rem;
  color: rgb(241 239 233 / 0.75);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.demo__actions { display: flex; gap: 2px; }
.demo__icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: var(--radius-s);
  background: transparent;
  color: rgb(241 239 233 / 0.75);
}
@media (hover: hover) { .demo__icon:hover { background: rgb(241 239 233 / 0.1); color: #fff; } }
.demo__close { background: rgb(241 239 233 / 0.1); color: #fff; }
.demo__window :focus-visible { outline-color: #8fb0ff; }

.demo__stage { position: relative; background: #fff; min-height: 0; }
.demo__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  opacity: 0;
  transition: opacity 0.5s var(--ease-out);
}
.demo__frame.is-ready { opacity: 1; }
.demo__status {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--c-paper);
  color: var(--c-ink-2);
  text-align: center;
}
.demo__fallback {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  font-weight: 600;
  color: var(--accent-deep);
}
.demo__foot {
  padding: 0.55rem 1rem;
  font-size: 0.8125rem;
  color: rgb(241 239 233 / 0.6);
  text-align: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .demo__dialog, .demo__dialog.is-mobile { width: 100%; height: 100%; border-radius: 0; margin: 0; }
  .demo__window { border-radius: 0; }
  .demo__dots { display: none; }
  .demo__bar { grid-template-columns: 1fr auto; }
  .demo__address { justify-self: start; }
}
</style>

<style>
html.demo-open { overflow: hidden; }
</style>
