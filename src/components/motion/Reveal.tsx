import {
  createElement,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from 'react'
import { gsap } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'

export type RevealVariant = 'up' | 'fade' | 'blur' | 'clipX' | 'scale'

type Props = {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  duration?: number
  className?: string
  as?: ElementType
  /** Recuo do topo da viewport em que o elemento dispara (padrão: 88%). */
  start?: string
  once?: boolean
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { y: 44, opacity: 0 },
  fade: { opacity: 0 },
  blur: { opacity: 0, y: 24, filter: 'blur(10px)' },
  clipX: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  scale: { opacity: 0, scale: 0.94 },
}

/**
 * Revelação ao rolar. Todo elemento do site nasce daqui para garantir que
 * nada apareça de forma seca e que o reduced-motion receba o estado final.
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 0.9,
  className,
  as = 'div',
  start = 'top 88%',
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { ...FROM[variant] },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          clipPath: 'inset(0 0% 0 0)',
          filter: 'blur(0px)',
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            once,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [variant, delay, duration, start, once])

  // `as` é sempre uma tag HTML (div/li/p/...); o ref só é lido no efeito.
  // eslint-disable-next-line react-hooks/refs
  return createElement(as, { ref, className }, children)
}
