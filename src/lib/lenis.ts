import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsapSetup'

let lenis: Lenis | null = null

/**
 * Lenis rola a própria janela (sem wrapper), então o ScrollTrigger continua
 * funcionando nativamente — basta repassar o update a cada frame.
 */
export function startLenis(): Lenis {
  if (lenis) return lenis

  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    touchMultiplier: 1.4,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function stopLenis(): void {
  lenis?.stop()
}

export function resumeLenis(): void {
  lenis?.start()
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Navegação suave para as âncoras internas, compensando a nav fixa. */
export function scrollToSection(selector: string): void {
  const target = document.querySelector(selector)
  if (!target) return
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.2 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
