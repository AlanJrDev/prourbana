import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, ScrollTrigger } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'
import { portfolio } from '@/content/site'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Reveal } from '@/components/motion/Reveal'

/**
 * Portfólio em scroll horizontal com pin em qualquer largura: a rolagem da
 * página (scroll normal, com touch no mobile) move a trilha lateralmente.
 * Com prefers-reduced-motion a trilha vira swipe horizontal manual.
 * O fundo (portfolio__bg) é CSS puro — sem JS, sem tocar no pin/scrub.
 */

/** Formas do fundo animado: posição/tamanho fixos (sem aleatório) — só CSS anima. */
const BG_SHAPES = [
  { l: 6, t: 14, s: 90, d: 26, k: 'ring' },
  { l: 18, t: 68, s: 34, d: 31, k: 'dot' },
  { l: 31, t: 24, s: 58, d: 37, k: 'ring' },
  { l: 44, t: 78, s: 22, d: 24, k: 'dot' },
  { l: 57, t: 12, s: 74, d: 34, k: 'ring' },
  { l: 69, t: 58, s: 40, d: 28, k: 'dot' },
  { l: 81, t: 20, s: 96, d: 42, k: 'ring' },
  { l: 92, t: 72, s: 30, d: 27, k: 'dot' },
  { l: 12, t: 42, s: 18, d: 22, k: 'dot' },
  { l: 38, t: 52, s: 46, d: 39, k: 'ring' },
  { l: 63, t: 36, s: 26, d: 25, k: 'dot' },
  { l: 86, t: 46, s: 64, d: 36, k: 'ring' },
  { l: 25, t: 86, s: 52, d: 33, k: 'ring' },
  { l: 74, t: 88, s: 20, d: 23, k: 'dot' },
] as const

export function Portfolio() {
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const pin = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    if (prefersReducedMotion()) {
      pin.classList.add('portfolio__pin--swipe')
      return
    }

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48)

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
    })

    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + distance(),
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      animation: tween,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    })

    return () => {
      st.kill()
      tween.kill()
    }
  }, [])

  return (
    <section className="portfolio section" id="portfolio">
      <div className="portfolio__bg" aria-hidden="true">
        {BG_SHAPES.map((shape) => (
          <i
            key={`${shape.l}-${shape.t}`}
            className={`portfolio__shape portfolio__shape--${shape.k}`}
            style={{
              left: `${shape.l}%`,
              top: `${shape.t}%`,
              width: shape.s,
              height: shape.s,
              animationDuration: `${shape.d}s`,
              animationDelay: `-${shape.d / 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container">
        <SectionHeader
          eyebrow={portfolio.eyebrow}
          title={portfolio.title}
          lead={portfolio.lead}
          align="center"
        />
      </div>

      <div className="portfolio__pin" ref={pinRef}>
        <div className="portfolio__track" ref={trackRef}>
          {portfolio.items.map((item, i) => (
            <Reveal
              key={item.src}
              variant="up"
              delay={Math.min(i * 0.06, 0.3)}
              className="portfolio__item"
            >
              <figure>
                <div className="portfolio__frame">
                  <img
                    src={item.src}
                    alt={item.title}
                    width={1400}
                    height={933}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <span className="portfolio__tag">{item.tag}</span>
                  <span className="portfolio__title">{item.title}</span>
                  <ArrowUpRight className="portfolio__arrow" aria-hidden="true" strokeWidth={1.5} />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
