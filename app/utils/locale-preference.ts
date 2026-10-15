import type { SiteLocale } from '~/data/site'

const KEY = 'milabs-lang'

/** Remembers the visitor's language choice (used only to highlight it on "/"; never to redirect). */
export function rememberLocale(code: SiteLocale) {
  try {
    localStorage.setItem(KEY, code)
  } catch {
    // Storage unavailable (private mode, blocked): the preference is optional.
  }
}

export function readLocalePreference(): SiteLocale | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'en' || v === 'fa' ? v : null
  } catch {
    return null
  }
}
