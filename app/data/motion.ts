/**
 * Motion tokens for GSAP. Kept in sync with the CSS custom properties in
 * assets/css/tokens.css (--dur-*, --ease-*).
 *
 * Principles
 *  - "reveal": content entering the viewport. Long, decelerating, plays once.
 *  - "settle": interface layers arriving after their container. Shorter, staggered.
 *  - "drift": scroll-linked parallax. Small distances, desktop only, never on body text.
 */
export const dur = {
  micro: 0.14,
  state: 0.26,
  settle: 0.7,
  reveal: 1.1,
  draw: 1.4,
} as const

export const ease = {
  reveal: 'expo.out',
  settle: 'power3.out',
  draw: 'power3.inOut',
  drift: 'none',
} as const

export const stagger = {
  words: 0.055,
  items: 0.08,
  layers: 0.12,
} as const

/** Media queries shared by every motion block (used with gsap.matchMedia). */
export const motionQueries = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(prefers-reduced-motion: no-preference) and (min-width: 960px)',
} as const
