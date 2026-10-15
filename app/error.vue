<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const route = useRoute()
const isFa = computed(() => route.path.startsWith('/fa'))
const copy = computed(() =>
  isFa.value
    ? { title: 'این صفحه وجود ندارد.', text: 'ممکن است پیوند قدیمی باشد یا نشانی اشتباه تایپ شده باشد.', home: 'رفتن به صفحه‌ی اصلی MiLabs', href: '/fa/' }
    : { title: 'This page does not exist.', text: 'The link may be old, or the address may have a typo.', home: 'Go to the MiLabs homepage', href: '/en/' },
)
useHead(() => ({
  htmlAttrs: { lang: isFa.value ? 'fa-IR' : 'en', dir: isFa.value ? 'rtl' : 'ltr' },
  title: `${props.error.statusCode ?? 404} · MiLabs`,
  meta: [{ name: 'robots', content: 'noindex' }],
}))
</script>

<template>
  <main class="err">
    <BrandMark />
    <div class="err__body">
      <p class="err__code" dir="ltr">Mi<span>{{ error.statusCode ?? 404 }}</span></p>
      <h1>{{ copy.title }}</h1>
      <p class="err__text">{{ copy.text }}</p>
      <a :href="copy.href" class="err__link">{{ copy.home }}</a>
    </div>
  </main>
</template>

<style scoped>
.err { min-height: 100svh; display: grid; grid-template-rows: auto 1fr; padding: var(--gutter); gap: var(--space-6); }
.err__body { align-self: center; display: grid; gap: var(--space-4); justify-items: start; max-width: 40rem; }
.err__code {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: clamp(5rem, 3rem + 10vw, 11rem);
  line-height: 0.9;
  letter-spacing: -0.06em;
}
.err__code span { color: var(--c-signal); }
h1 { font-size: var(--fs-h3); }
.err__text { color: var(--fg-muted); }
.err__link { font-weight: 600; color: var(--c-signal-ink); min-height: 2.75rem; display: inline-flex; align-items: center; }
</style>
