import { createElement, useLayoutEffect, useRef } from 'react'
import { gsap, SplitText } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  lines: readonly string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  start?: string
  delay?: number
  stagger?: number
}

/**
 * Título com uma linha por bloco mascarado: os caracteres sobem de dentro
 * da máscara. A quebra de linha é controlada pelo CSS (não por medição),
 * então o resultado é idêntico em qualquer viewport.
 * Com reduced-motion o texto aparece inteiro, sem split.
 */
export function SplitHeading({
  lines,
  as = 'h2',
  className,
  start = 'top 85%',
  delay = 0,
  stagger = 0.026,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: 'chars', charsClass: 'split__char' })
      gsap.set(el, { opacity: 1 })
      gsap.from(split.chars, {
        yPercent: 118,
        duration: 0.95,
        ease: 'power4.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      })
      return () => split.revert()
    }, el)

    return () => ctx.revert()
  }, [lines, start, delay, stagger])

  return createElement(
    as,
    // eslint-disable-next-line react-hooks/refs -- `as` é sempre uma tag HTML
    { ref, className: `split ${className ?? ''}`.trim() },
    lines.map((line, i) => (
      <span className="split__line" key={i}>
        {line}
      </span>
    )),
  )
}
