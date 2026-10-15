<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip-link">{{ t('a11y.skip') }}</a>
    <SiteHeader />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
main:focus { outline: none; }
</style>
