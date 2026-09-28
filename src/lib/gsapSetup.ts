import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }

/** Cria um contexto GSAP com limpeza automática no unmount. */
export function createScope(scope: HTMLElement | null) {
  return gsap.context(() => undefined, scope ?? undefined)
}
