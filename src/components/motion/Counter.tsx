import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

/** Contador que só anima quando entra na viewport. */
export function Counter({ to, prefix = '', suffix = '', duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const final = `${prefix}${to}${suffix}`

    if (prefersReducedMotion()) {
      el.textContent = final
      return
    }

    const ctx = gsap.context(() => {
      const state = { v: 0 }
      el.textContent = `${prefix}0${suffix}`
      gsap.to(state, {
        v: to,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(state.v)}${suffix}`
        },
        onComplete: () => {
          el.textContent = final
        },
      })
    }, el)

    return () => ctx.revert()
  }, [to, prefix, suffix, duration])

  return (
    <span ref={ref} className={`counter ${className ?? ''}`.trim()}>
      {prefix}
      {to}
      {suffix}
    </span>
  )
}
