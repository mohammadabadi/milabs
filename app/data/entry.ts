import type { SiteLocale } from './site'

/**
 * Copy for the language entry page at "/". This page sits outside the
 * localized routes and shows both languages at once, so its strings live
 * here rather than in the i18n locale files (which are loaded per locale).
 */
export const entryCopy: Record<
  SiteLocale,
  { title: string; description: string; heading: string; line: string; cta: string; lastUsed: string; ogAlt: string }
> = {
  en: {
    title: 'MiLabs: choose your language',
    description: 'MiLabs makes the Mi family of products: MiDesk and MiFin. Choose English or Persian.',
    heading: 'Choose your language',
    line: 'Focused software for work and money.',
    cta: 'Continue in English',
    lastUsed: 'Last used',
    ogAlt: 'MiLabs: software that brings order to work and money.',
  },
  fa: {
    title: 'MiLabs؛ انتخاب زبان',
    description: 'MiLabs سازنده‌ی خانواده‌ی محصولات Mi است: MiDesk و MiFin. زبان فارسی یا انگلیسی را انتخاب کنید.',
    heading: 'زبان را انتخاب کنید',
    line: 'نرم‌افزارهای متمرکز برای کار و پول.',
    cta: 'ادامه به فارسی',
    lastUsed: 'آخرین انتخاب',
    ogAlt: 'MiLabs؛ نرم‌افزارهایی که به کار و پول نظم می‌دهند.',
  },
}
