<script setup lang="ts">
import { locales, type SiteLocale } from '~/data/site'
import { rememberLocale } from '~/utils/locale-preference'

/**
 * Language switcher. Each option is a real, crawlable link to the
 * equivalent page in the other language. On click the current section
 * anchor is kept, so the visitor lands at the same place.
 */
withDefaults(defineProps<{ variant?: 'compact' | 'list' }>(), { variant: 'compact' })

const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

/** Equivalent page in another language, normalized to the canonical trailing-slash form, without hash. */
function targetPath(code: SiteLocale) {
  const path = (switchLocalePath(code) || `/${code}/`).split('#')[0]!.split('?')[0]!
  return path.endsWith('/') ? path : `${path}/`
}

const options = computed(() =>
  locales.map((code) => ({
    code,
    path: targetPath(code),
    // Each language name is written in its own language
    native: code === 'fa' ? 'فارسی' : 'English',
    short: code === 'fa' ? 'فا' : 'EN',
    active: code === locale.value,
  })),
)

function onSwitch(event: MouseEvent, code: SiteLocale, path: string) {
  rememberLocale(code)
  const hash = window.location.hash
  if (hash && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    event.preventDefault()
    // Full navigation: <html lang/dir>, fonts and metadata all switch cleanly
    window.location.assign(path + hash)
  }
}
</script>

<template>
  <nav class="lang" :class="`lang--${variant}`" :aria-label="t('lang.label')">
    <ul role="list" class="lang__list">
      <li v-for="o in options" :key="o.code">
        <span v-if="o.active" class="lang__item is-active" aria-current="true" :lang="o.code">
          <span v-if="variant === 'compact'" aria-hidden="true">{{ o.short }}</span>
          <span :class="{ 'visually-hidden': variant === 'compact' }">{{ o.native }}</span>
        </span>
        <a
          v-else
          class="lang__item"
          :href="o.path"
          :hreflang="o.code"
          :lang="o.code"
          :title="t('lang.switchTo', { language: o.native })"
          @click="onSwitch($event, o.code, o.path)"
        >
          <span v-if="variant === 'compact'" aria-hidden="true">{{ o.short }}</span>
          <span :class="{ 'visually-hidden': variant === 'compact' }">{{ o.native }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.lang__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.lang--compact .lang__list {
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-pill);
  box-shadow: inset 0 0 0 1px var(--line);
}
.lang__item {
  display: inline-grid;
  place-items: center;
  min-width: 2.5rem;
  min-height: 2.25rem;
  padding-inline: 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  color: var(--fg-muted);
  transition: color var(--dur-2) var(--ease-out), background-color var(--dur-2) var(--ease-out);
}
.lang__item[lang='fa-IR'] { font-family: 'Yekan Bakh', 'Yekan Bakh Fallback', sans-serif; font-size: 0.875rem; }
.lang__item[lang='en'] { font-family: 'Instrument Sans Variable', sans-serif; letter-spacing: 0.04em; }
.lang--compact .is-active { background: var(--fg); color: var(--bg); }
@media (hover: hover) {
  a.lang__item:hover { color: var(--fg); background: var(--bg-sunken, rgb(0 0 0 / 0.05)); }
}

.lang--list .lang__list { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
.lang--list .lang__item {
  display: inline-flex;
  min-height: 2.25rem;
  padding: 0;
  font-size: var(--fs-small);
  font-weight: 450;
  color: var(--fg-soft);
}
.lang--list .is-active { color: var(--fg); font-weight: 600; }
.lang--list .is-active::after {
  content: '';
  width: 6px;
  height: 6px;
  margin-inline-start: 0.5rem;
  border-radius: 50%;
  background: var(--c-signal);
}
@media (hover: hover) {
  .lang--list a.lang__item:hover { background: none; text-decoration: underline; }
}
</style>
