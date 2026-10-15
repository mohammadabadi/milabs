import type { Ref } from 'vue'
import { motionQueries } from '~/data/motion'
import { pageReady } from '~/utils/page-ready'

type Gsap = typeof import('gsap').gsap
type ScrollTriggerType = typeof import('gsap/ScrollTrigger').ScrollTrigger

export interface MotionApi {
  gsap: Gsap
  ScrollTrigger: ScrollTriggerType
  /** Root element of the component, for scoped selectors. */
  root: HTMLElement
  /** Shorthand for gsap.utils.toArray scoped to the root. */
  q: (selector: string) => HTMLElement[]
}

export interface MotionConditions {
  /** Visitor has not asked for reduced motion. */
  motion: boolean
  /** Motion allowed and viewport is at least 960px wide (parallax, larger travel). */
  desktop: boolean
}

let loader: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerType }> | null = null

/**
 * Loads GSAP + ScrollTrigger once, on demand. Keeping them out of the
 * entry chunk means the page renders and becomes interactive before any
 * animation code is downloaded.
 */
export function loadGsap() {
  loader ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger)
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger }
  })
  return loader
}

/**
 * Scoped, self-cleaning GSAP setup for a component.
 *
 * `setup` runs inside gsap.matchMedia, so every tween and ScrollTrigger it
 * creates is reverted automatically when the media conditions change (for
 * example when the visitor turns on reduced motion) and when the component
 * unmounts. `afterLoader` delays the setup until the page loader has lifted.
 * With reduced motion, `setup` is still called with
 * `motion: false` so it can keep content in its final, visible state.
 */
export function useMotion(
  root: Ref<HTMLElement | null | undefined>,
  setup: (api: MotionApi, when: MotionConditions) => void | (() => void),
  options: { afterLoader?: boolean } = {},
) {
  let mm: gsap.MatchMedia | null = null
  let disposed = false

  onMounted(async () => {
    // Intro animations wait for the page loader to lift, so they are seen
    if (options.afterLoader) await pageReady
    const { gsap, ScrollTrigger } = await loadGsap()
    const el = root.value
    if (disposed || !el) return

    mm = gsap.matchMedia(el)
    mm.add(
      { motion: motionQueries.motion, desktop: motionQueries.desktop },
      (ctx) => {
        const when = ctx.conditions as unknown as MotionConditions
        const q = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, el)
        return setup({ gsap, ScrollTrigger, root: el, q }, when)
      },
    )
  })

  onBeforeUnmount(() => {
    disposed = true
    mm?.revert()
    mm = null
  })
}
