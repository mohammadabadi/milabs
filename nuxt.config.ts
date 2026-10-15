import { siteUrl } from './app/data/site'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n'],

  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/fonts.css', '~/assets/css/tokens.css', '~/assets/css/base.css'],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
  },

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    baseUrl: siteUrl,
    // The root URL is a language entry point, never an automatic redirect.
    detectBrowserLanguage: false,
    // Composition API only, and no global components/directives: smaller entry bundle.
    // (The message compiler must stay: lazy-loaded locale messages are compiled in the browser.)
    bundle: { compositionOnly: true, fullInstall: false },
    locales: [
      { code: 'en', language: 'en', dir: 'ltr', name: 'English', file: 'en.json' },
      { code: 'fa', language: 'fa-IR', dir: 'rtl', name: 'فارسی', file: 'fa.json' },
    ],
  },

  router: {
    options: { scrollBehaviorType: 'smooth' },
  },

  nitro: {
    prerender: {
      routes: ['/', '/en', '/fa', '/sitemap.xml'],
      crawlLinks: true,
      failOnError: true,
    },
  },

  hooks: {
    // @nuxtjs/i18n ignores "/" during prerendering when using the `prefix`
    // strategy. Our root is a real, crawlable language-selection page, so we
    // drop that rule (any RegExp matching "/")
    // remove that rule once every module has registered its own hooks.
    'nitro:init'(nitro) {
      nitro.hooks.hook('prerender:routes', (routes) => {
        nitro.options.prerender.ignore = nitro.options.prerender.ignore.filter(
          (rule) => !(rule instanceof RegExp && rule.test('/')),
        )
        routes.add('/')
      })
    },
  },

  typescript: { strict: true },
})
