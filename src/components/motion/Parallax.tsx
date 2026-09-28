import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  children: ReactNode
  /** Fração do deslocamento (0.1 = 10% da altura do elemento). */
  amount?: number
  className?: string
  start?: string
  end?: string
}

/** Parallax suave preso ao scroll, sempre via transform. */
export function Parallax({
  children,
  amount = 0.12,
  className,
  start = 'top bottom',
  end = 'bottom top',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount * 100 },
        {
          yPercent: amount * 100,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start, end, scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [amount, start, end])

  return (
    <div ref={ref} className={`parallax ${className ?? ''}`.trim()}>
      {children}
    </div>
  )
}
