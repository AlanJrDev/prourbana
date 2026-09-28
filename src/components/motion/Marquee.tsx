import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  children: ReactNode
  speed?: number
  className?: string
}

/** Faixa de texto em deslocamento infinito (pausa com reduced-motion). */
export function Marquee({ children, speed = 40, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const distance = track.scrollWidth / 2
      gsap.to(track, {
        x: -distance,
        duration: distance / speed,
        ease: 'none',
        repeat: -1,
      })
    }, track)

    return () => ctx.revert()
  }, [speed])

  return (
    <div className={`marquee ${className ?? ''}`.trim()} aria-hidden="true">
      <div className="marquee__track" ref={trackRef}>
        <div className="marquee__group">{children}</div>
        <div className="marquee__group">{children}</div>
      </div>
    </div>
  )
}
