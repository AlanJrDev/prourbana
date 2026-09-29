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
 * O fundo (portfolio__bg) tem: flutuação ociosa em CSS (independente do
 * scroll) + parallax suave via ScrollTrigger (profundidade ao rolar);
 * reduced-motion deixa tudo estático.
 */

/** Cores variadas do fundo (paleta derivada do logo). */
const BG_COLORS = [
  'var(--petro-900)',
  'var(--copper-600)',
  'var(--petro-700)',
  'var(--copper-500)',
  'var(--petro-600)',
  'var(--copper-400)',
] as const

/** Formas do fundo: quadra redonda, triângulo, anel e cruz — com extrusão/
 *  faces sombreadas no SVG pra parecerem 3D. Posição/tamanho fixos (sem
 *  aleatório); flutuação é CSS, profundidade é parallax. */
const BG_SHAPES = [
  { l: 3, t: 8, s: 120, d: 30, k: 'sq', c: 0 },
  { l: 14, t: 58, s: 70, d: 26, k: 'tri', c: 1 },
  { l: 24, t: 18, s: 60, d: 36, k: 'ring', c: 3 },
  { l: 33, t: 72, s: 90, d: 32, k: 'cross', c: 2 },
  { l: 43, t: 10, s: 74, d: 40, k: 'sq', c: 4 },
  { l: 52, t: 64, s: 110, d: 28, k: 'tri', c: 5 },
  { l: 62, t: 30, s: 66, d: 34, k: 'ring', c: 1 },
  { l: 71, t: 84, s: 80, d: 24, k: 'sq', c: 3 },
  { l: 80, t: 14, s: 130, d: 42, k: 'tri', c: 0 },
  { l: 88, t: 56, s: 70, d: 30, k: 'cross', c: 4 },
  { l: 95, t: 26, s: 60, d: 36, k: 'ring', c: 2 },
  { l: 8, t: 34, s: 84, d: 38, k: 'cross', c: 5 },
  { l: 19, t: 86, s: 66, d: 27, k: 'sq', c: 1 },
  { l: 29, t: 44, s: 54, d: 44, k: 'tri', c: 3 },
  { l: 39, t: 90, s: 72, d: 25, k: 'ring', c: 0 },
  { l: 47, t: 40, s: 58, d: 33, k: 'sq', c: 2 },
  { l: 57, t: 76, s: 96, d: 29, k: 'cross', c: 3 },
  { l: 67, t: 50, s: 64, d: 41, k: 'tri', c: 4 },
  { l: 76, t: 68, s: 88, d: 26, k: 'sq', c: 5 },
  { l: 85, t: 38, s: 56, d: 35, k: 'ring', c: 1 },
  { l: 93, t: 80, s: 76, d: 31, k: 'tri', c: 2 },
  { l: 5, t: 70, s: 64, d: 33, k: 'ring', c: 4 },
  { l: 11, t: 20, s: 58, d: 29, k: 'cross', c: 0 },
  { l: 36, t: 6, s: 66, d: 37, k: 'tri', c: 1 },
  { l: 50, t: 22, s: 80, d: 43, k: 'sq', c: 3 },
  { l: 60, t: 6, s: 52, d: 24, k: 'ring', c: 5 },
  { l: 70, t: 12, s: 60, d: 39, k: 'cross', c: 1 },
  { l: 22, t: 32, s: 46, d: 34, k: 'sq', c: 4 },
] as const

/** SVG por tipo — 2D desenhado pra ler como 3D (extrusão/faces/brilho). */
function ShapeArt({ k }: { k: string }) {
  if (k === 'sq') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="9" y="9" width="34" height="34" rx="9" fill="currentColor" opacity="0.5" />
        <rect x="4" y="4" width="34" height="34" rx="9" fill="currentColor" />
        <path d="M12 9h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      </svg>
    )
  }
  if (k === 'tri') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M4 40h40l3 4H7Z" fill="currentColor" opacity="0.5" />
        <path d="M24 6 44 40H4Z" fill="currentColor" />
        <path d="M24 6v34h20Z" fill="#000" opacity="0.16" />
      </svg>
    )
  }
  if (k === 'cross') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M17 7h14v10h10v14H31v10H17V31H7V17h10Z"
          fill="currentColor"
          opacity="0.5"
          transform="translate(4 4)"
        />
        <path d="M17 7h14v10h10v14H31v10H17V31H7V17h10Z" fill="currentColor" />
        <path d="M11 13h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="9" />
      <path
        d="M11 17a17 17 0 0 1 26 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M13 33a15 15 0 0 0 22 0"
        fill="none"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.18"
      />
    </svg>
  )
}

export function Portfolio() {
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const pin = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    if (prefersReducedMotion()) {
      pin.classList.add('portfolio__pin--swipe')
      return
    }

    // parallax do fundo: deriva suave contra o scroll (profundidade), sem
    // depender da posição de rolagem das formas (flutuação é CSS à parte)
    let bgSt: ScrollTrigger | undefined
    let bgTween: gsap.core.Tween | undefined
    if (bgRef.current) {
      bgTween = gsap.fromTo(bgRef.current, { yPercent: -7 }, { yPercent: 7, ease: 'none' })
      bgSt = ScrollTrigger.create({
        trigger: pin,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        animation: bgTween,
        invalidateOnRefresh: true,
      })
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
      bgSt?.kill()
      bgTween?.kill()
    }
  }, [])

  return (
    <section className="portfolio section" id="portfolio">
      <div className="portfolio__bg" ref={bgRef} aria-hidden="true">
        {BG_SHAPES.map((shape) => (
          <i
            key={`${shape.l}-${shape.t}`}
            className={`portfolio__shape portfolio__shape--${shape.k}`}
            style={{
              left: `${shape.l}%`,
              top: `${shape.t}%`,
              width: shape.s,
              height: shape.s,
              color: BG_COLORS[shape.c],
              animationDuration: `${shape.d}s`,
              animationDelay: `-${shape.d / 3}s`,
            }}
          >
            <ShapeArt k={shape.k} />
          </i>
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
