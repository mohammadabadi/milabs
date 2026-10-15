export interface Word {
  text: string
  /** Rendered with the editorial accent style. */
  em: boolean
  /** Punctuation glued to this word (no space before it), e.g. the "." after an emphasized word. */
  tail?: string
}

/**
 * Splits a localized headline into words for staggered typography.
 * `*text*` marks an emphasized phrase. Splitting only on spaces keeps
 * Persian words (including ZWNJ-joined compounds) intact, so letter
 * shaping is never broken. Punctuation that directly follows an
 * emphasized phrase is attached to its last word so no gap appears.
 */
export function splitHeadline(source: string): Word[] {
  const words: Word[] = []
  source.split('*').forEach((chunk, i) => {
    const em = i % 2 === 1
    let rest = chunk
    const glued = !em && words.length && /^[^\s]/.test(chunk) ? chunk.match(/^[^\s]+/)?.[0] : undefined
    if (glued) {
      words[words.length - 1]!.tail = glued
      rest = chunk.slice(glued.length)
    }
    for (const text of rest.split(' ')) {
      if (text) words.push({ text, em })
    }
  })
  return words
}

/** Removes emphasis markers, for plain-text uses such as aria-labels. */
export function plainHeadline(source: string) {
  return source.replaceAll('*', '')
}

/** Locale-aware number formatting (Persian digits in Persian). */
export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', options).format(value)
}
