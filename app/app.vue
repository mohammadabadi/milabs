<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  meta: [{ name: 'theme-color', content: '#f4f2ed' }],
  script: [
    {
      // Runs before first paint. Enables the page loader only when JavaScript
      // works, and removes it after 8 s whatever happens, so content can never
      // be trapped behind it.
      key: 'loader-boot',
      tagPosition: 'head',
      innerHTML:
        "(function(d){d.classList.add('js','is-loading');setTimeout(function(){d.classList.add('loader-timeout');d.classList.remove('is-loading')},8000)})(document.documentElement)",
    },
  ],
})
</script>

<template>
  <PageLoader />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
