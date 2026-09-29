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
 */
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
