import { media, rural, whatsappUrl } from '@/content/site'
import { assets } from '@/lib/assets'
import { prefersReducedMotion } from '@/lib/motion'
import { VideoScrub } from '@/components/frame/VideoScrub'
import { SplitHeading } from '@/components/motion/SplitHeading'
import { Reveal } from '@/components/motion/Reveal'
import { ArrowFillButton } from '@/components/ui/ArrowFillButton'

/** Seção rural: vídeo de8s em loop nativo como a hero (sem vai-e-volta) — bytes já vêm do preloader (blob); o src só seta perto da seção. */
export function Rural() {
  const reduced = prefersReducedMotion()

  return (
    <section className="rural section" id="rural">
      <VideoScrub
        className="rural__media"
        mode="play"
        src={assets.getRuralSrc()}
        poster={media.rural.poster}
        freezeAt={media.rural.freezeAt}
        lazy
        paused={reduced}
      />
      <div className="rural__scrim" aria-hidden="true" />

      <div className="container rural__content">
        <div className="rural__text">
          <Reveal variant="fade" className="eyebrow eyebrow--light">
            <span className="eyebrow__dot" aria-hidden="true" />
            {rural.eyebrow}
          </Reveal>

          <SplitHeading
            lines={rural.title}
            as="h2"
            className="rural__title"
            start="top 80%"
          />

          <Reveal variant="up" delay={0.14} className="rural__lead">
            <p>{rural.lead}</p>
          </Reveal>

          <Reveal variant="up" delay={0.22} className="rural__chips">
            <ul>
              {rural.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="up" delay={0.3} className="rural__cta">
            <ArrowFillButton
              btnText={rural.cta}
              href={whatsappUrl()}
              variant="light"
              target="_blank"
              rel="noopener noreferrer"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
