<script setup lang="ts">
import { site } from '~/data/site'

/**
 * Header: transparent over the hero, then a compact paper bar once the
 * visitor scrolls. On small screens the links move into a disclosure menu;
 * the language switcher always stays visible.
 */
const { t } = useI18n()
const localePath = useLocalePath()
// Canonical form of the localized homepage is "/en/" (trailing slash)
const homePath = computed(() => localePath('/').replace(/\/?$/, '/'))

const scrolled = ref(false)
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)

const links = computed(() => [
  { href: '#products', label: t('nav.products') },
  { href: '#approach', label: t('nav.approach') },
  ...(site.contactEmail ? [{ href: `mailto:${site.contactEmail}`, label: t('nav.contact') }] : []),
])

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function close(returnFocus = false) {
  if (!open.value) return
  open.value = false
  if (returnFocus) menuButton.value?.focus()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close(true)
}

function onResize() {
  if (window.innerWidth >= 860) close()
}

watch(open, async (v) => {
  document.documentElement.classList.toggle('menu-open', v)
  if (v) {
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a')?.focus()
  }
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  document.documentElement.classList.remove('menu-open')
})
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': scrolled, 'is-open': open }">
    <div class="header__bar container">
      <NuxtLink :to="homePath" class="header__brand" :aria-label="t('a11y.home')">
        <BrandMark />
      </NuxtLink>

      <nav class="header__nav" :aria-label="t('a11y.mainNav')">
        <ul role="list">
          <li v-for="l in links" :key="l.href">
            <a :href="l.href" class="header__link">{{ l.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="header__end">
        <LanguageSwitcher />
        <ActionLink to="#products" variant="primary" icon="none" class="header__cta">{{ t('nav.cta') }}</ActionLink>
        <button
          ref="menuButton"
          type="button"
          class="header__toggle"
          :aria-expanded="open"
          aria-controls="mobile-menu"
          @click="open = !open"
        >
          <span class="visually-hidden">{{ open ? t('a11y.closeMenu') : t('a11y.menu') }}</span>
          <span class="burger" aria-hidden="true"><span /><span /></span>
        </button>
      </div>
    </div>

    <div id="mobile-menu" ref="panel" class="menu" :hidden="!open" @click.self="close()">
      <nav class="menu__inner container" :aria-label="t('a11y.mainNav')">
        <ul role="list" class="menu__list">
          <li v-for="(l, i) in links" :key="l.href" :style="{ '--i': i }">
            <a :href="l.href" class="menu__link" @click="close()">
              <span class="menu__num" aria-hidden="true">0{{ i + 1 }}</span>{{ l.label }}
            </a>
          </li>
        </ul>
        <ActionLink to="#products" variant="primary" class="menu__cta" @click="close()">{{ t('nav.cta') }}</ActionLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(244 242 237 / 0.86);
  backdrop-filter: saturate(1.4) blur(14px);
  -webkit-backdrop-filter: saturate(1.4) blur(14px);
  box-shadow: 0 1px 0 var(--line);
  opacity: 0;
  transition: opacity var(--dur-3) var(--ease-out);
}
.header.is-scrolled::before,
.header.is-open::before { opacity: 1; }

.header__bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 100%;
}
.header__brand {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  text-decoration: none;
  border-radius: var(--radius-s);
}

.header__nav { margin-inline-start: auto; }
.header__nav ul { display: flex; gap: var(--space-2); margin: 0; padding: 0; }
.header__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding-inline: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--fg-soft);
  text-decoration: none;
  transition: color var(--dur-2) var(--ease-out);
}
.header__link::after {
  content: '';
  position: absolute;
  inset-inline: 0.75rem;
  bottom: 0.55rem;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: var(--origin, left);
  transition: transform var(--dur-3) var(--ease-out);
}
:root[dir='rtl'] .header__link::after { --origin: right; }
@media (hover: hover) {
  .header__link:hover { color: var(--fg); }
  .header__link:hover::after { transform: scaleX(1); }
}

.header__end { display: flex; align-items: center; gap: var(--space-3); }
.header__cta { min-height: 2.5rem; padding-inline: 1.1rem; font-size: 0.875rem; }

.header__toggle {
  display: none;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: var(--fg);
  color: var(--bg);
}
.burger { display: grid; gap: 5px; width: 16px; }
.burger span {
  display: block;
  height: 1.5px;
  background: currentColor;
  transition: transform var(--dur-2) var(--ease-out);
}
.is-open .burger span:first-child { transform: translateY(3.25px) rotate(45deg); }
.is-open .burger span:last-child { transform: translateY(-3.25px) rotate(-45deg); }

.menu {
  position: fixed;
  inset: var(--header-h) 0 0;
  background: rgb(20 20 19 / 0.25);
}
.menu__inner {
  display: grid;
  gap: var(--space-6);
  padding-block: var(--space-5) var(--space-7);
  background: var(--c-paper);
  box-shadow: 0 1px 0 var(--line), var(--shadow-m);
}
.menu__list { margin: 0; }
.menu__list li {
  border-bottom: 1px solid var(--line);
  animation: menu-in var(--dur-3) var(--ease-out) both;
  animation-delay: calc(var(--i) * 50ms);
}
.menu__link {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  padding-block: var(--space-4);
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: var(--tracking-heading);
  text-decoration: none;
}
.menu__num { font-family: var(--font-mono); font-size: var(--fs-label); color: var(--fg-muted); }
.menu__cta { justify-self: start; }
@keyframes menu-in {
  from { opacity: 0; transform: translateY(-8px); }
}

@media (max-width: 859.98px) {
  .header__nav, .header__end .header__cta { display: none; }
  .header__end { margin-inline-start: auto; }
  .header__toggle { display: inline-grid; }
}
@media (min-width: 860px) {
  .menu { display: none; }
}
</style>

<style>
html.menu-open { overflow: hidden; }
</style>
