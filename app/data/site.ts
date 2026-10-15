/**
 * Site-wide configuration. Only verified information belongs here:
 * leave optional fields empty rather than inventing values.
 */
export const siteUrl = 'https://milabs.ir'

export const site = {
  name: 'MiLabs',
  url: siteUrl,
  /** Public contact e-mail. Leave empty until a verified address exists; the UI hides contact links when empty. */
  contactEmail: '',
  /** Verified social profiles, e.g. { label: 'LinkedIn', url: 'https://…' }. Rendered in the footer when present. */
  social: [] as { label: string; url: string }[],
  /** First year shown in the copyright line. */
  foundedYear: 2026,
} as const

export const locales = ['en', 'fa'] as const
export type SiteLocale = (typeof locales)[number]

export const ogLocale: Record<SiteLocale, string> = { en: 'en_US', fa: 'fa_IR' }
