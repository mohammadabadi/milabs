/**
 * Resolves once the page loader has finished its exit animation, so intro
 * animations (like the hero sequence) start when the visitor can see them.
 * On the server, and when no loader runs, it resolves immediately.
 */
let resolve: (() => void) | null = null
let done = false

export const pageReady: Promise<void> = import.meta.client
  ? new Promise<void>((r) => {
      resolve = () => {
        done = true
        r()
      }
    })
  : Promise.resolve()

export function markPageReady() {
  resolve?.()
}

export function isPageReady() {
  return !import.meta.client || done
}
