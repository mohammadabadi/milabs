<script setup lang="ts">
import { visibleProducts } from '~/data/products'
import { site } from '~/data/site'

const { t } = useI18n()
const year = new Date().getFullYear()

// The giant wordmark is faint ink; a soft light follows the mouse and paints
// it in full color where the cursor passes (mouse only, decorative).
const giant = ref<HTMLElement | null>(null)
function onGiantMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !giant.value) return
  const r = giant.value.getBoundingClientRect()
  giant.value.style.setProperty('--lx', `${e.clientX - r.left}px`)
  giant.value.style.setProperty('--ly', `${e.clientY - r.top}px`)
  giant.value.classList.add('is-lit')
}
function onGiantLeave() {
  giant.value?.classList.remove('is-lit')
}
</script>

<template>
  <footer class="footer on-dark">
    <div class="container footer__grid">
      <div class="footer__id">
        <BrandMark :size="32" style="--brand-bg: var(--c-night)" />
        <p class="footer__tagline">{{ t('footer.tagline') }}</p>
      </div>

      <nav class="footer__col" :aria-label="t('footer.products')">
        <h2 class="eyebrow">{{ t('footer.products') }}</h2>
        <ul role="list">
          <li v-for="p in visibleProducts" :key="p.id">
            <a :href="p.url" target="_blank" rel="noopener noreferrer" class="footer__link" dir="ltr">
              {{ p.name }}
              <ArrowIcon direction="external" />
              <span class="visually-hidden">({{ t('a11y.newTab') }})</span>
            </a>
          </li>
        </ul>
      </nav>

      <nav class="footer__col" :aria-label="t('footer.company')">
        <h2 class="eyebrow">{{ t('footer.company') }}</h2>
        <ul role="list">
          <li><a href="#approach" class="footer__link">{{ t('nav.approach') }}</a></li>
          <li v-if="site.contactEmail">
            <a :href="`mailto:${site.contactEmail}`" class="footer__link" dir="ltr">{{ site.contactEmail }}</a>
          </li>
          <li v-for="s in site.social" :key="s.url">
            <a :href="s.url" target="_blank" rel="noopener noreferrer me" class="footer__link">{{ s.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="footer__col">
        <h2 class="eyebrow">{{ t('footer.language') }}</h2>
        <LanguageSwitcher variant="list" />
      </div>
    </div>

    <div class="container footer__base">
      <p>{{ t('footer.rights', { year }) }}</p>
      <a href="#top" class="footer__link">{{ t('footer.backToTop') }}</a>
    </div>

    <div
      ref="giant"
      class="footer__giant decor"
      aria-hidden="true"
      dir="ltr"
      @pointermove="onGiantMove"
      @pointerleave="onGiantLeave"
    >
      <svg class="footer__giant-svg" viewBox="0 0 1000 300" preserveAspectRatio="xMinYMax meet"><text x="0" y="290">MiLabs</text></svg>
      <svg class="footer__giant-svg footer__giant-lit" viewBox="0 0 1000 300" preserveAspectRatio="xMinYMax meet"><text x="0" y="290">MiLabs</text></svg>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  padding-block: var(--space-8) 0;
}
.footer__grid {
  display: grid;
  gap: var(--space-7) var(--grid-gap);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.footer__id { grid-column: 1 / -1; display: grid; gap: var(--space-4); align-content: start; }
.footer__tagline { color: var(--fg-muted); max-width: 22rem; }
.footer__col { display: grid; gap: var(--space-4); align-content: start; }
.footer__col ul { display: grid; gap: var(--space-1); margin: 0; }
.footer__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  color: var(--fg-soft);
  text-decoration: none;
  font-size: var(--fs-small);
}
@media (hover: hover) {
  .footer__link:hover { color: var(--fg); text-decoration: underline; }
}
.footer__col :deep(.lang__item) { color: var(--fg-soft); }
.footer__col :deep(.is-active) { color: var(--fg); }

.footer__base {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-block-start: var(--space-8);
  padding-block: var(--space-5);
  border-top: 1px solid var(--line);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.footer__giant {
  position: relative;
  padding-inline: var(--gutter);
  margin-block: var(--space-6) -1%;
  user-select: none;
}
.footer__giant-lit {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: var(--gutter);
  opacity: 0;
  -webkit-mask-image: radial-gradient(180px circle at calc(var(--lx, -999px) - var(--gutter)) var(--ly, -999px), #000 20%, transparent 70%);
  mask-image: radial-gradient(180px circle at calc(var(--lx, -999px) - var(--gutter)) var(--ly, -999px), #000 20%, transparent 70%);
  transition: opacity 0.4s var(--ease-out);
}
.footer__giant-lit text { fill: var(--c-signal) !important; }
.is-lit .footer__giant-lit { opacity: 0.9; }
.footer__giant-svg { display: block; width: min(100%, 72rem); height: auto; overflow: visible; }
.footer__giant-svg text {
  font-family: 'Instrument Sans Variable', sans-serif;
  font-weight: 600;
  font-size: 330px;
  letter-spacing: -18px;
  fill: rgb(241 239 233 / 0.07);
}

@media (min-width: 760px) {
  .footer__grid { grid-template-columns: 2fr 1fr 1fr 1fr; }
  .footer__id { grid-column: auto; }
}
</style>
