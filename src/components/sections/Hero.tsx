import { useEffect, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { prefersReducedMotion } from '@/lib/motion'
import { assets } from '@/lib/assets'
import { brand, hero } from '@/content/site'
import { VideoScrub } from '@/components/frame/VideoScrub'
import { Reveal } from '@/components/motion/Reveal'
import { InteractiveHoverButton } from '@/components/ui/InteractiveHoverButton'
import { WhatsAppCTA } from '@/components/layout/WhatsAppCTA'

/** Distância de rolagem em que a logo grande sai e o header assume (px). */
const TOP_EXIT = 140

/**
 * Hero: o vídeo urbano toca sozinho em loop (exibição nativa — sem scrub por
 * rolagem) com o drone o mais livre possível. No topo, a logo grande ocupa o
 * espaço vazio acima do drone e o header fica escondido; ao rolar, o header
 * assume a posição e a logo some. Padrão mínimo de texto: só a frase curta e
 * os dois botões — h1 vira sr-only; no celular entra também o subtítulo.
 * O vídeo é escolhido por largura de tela (assets.ts): ≤620px toca a cena do
 * drone já voando, acima disso, o paisagem atual.
 */
export function Hero() {
  const reduced = prefersReducedMotion()
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < TOP_EXIT)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero" id="topo">
      <VideoScrub
        className="hero__media"
        mode="play"
        src={assets.getHeroSrc()}
        poster={assets.getHeroPoster()}
        paused={reduced}
      />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />

      <div className={`hero__brand ${atTop ? '' : 'hero__brand--hidden'}`.trim()}>
        <img src={brand.monogram} alt="" width={120} height={120} decoding="async" />
        <img src={brand.wordmark} alt="Prourbana" decoding="async" />
      </div>

      <div className="hero__content container">
        <h1 className="hero__title">{hero.title.join(' ')}</h1>

        <Reveal variant="up" delay={0.45} start="top 100%" className="hero__short">
          <p>{hero.short}</p>
        </Reveal>

        <Reveal variant="up" delay={0.55} start="top 100%" className="hero__sub">
          <p>{hero.sub}</p>
        </Reveal>

        <Reveal variant="up" delay={0.62} start="top 100%" className="hero__actions">
          <WhatsAppCTA size="lg" label={hero.primaryCta} />
          <InteractiveHoverButton
            text={hero.secondaryCta}
            href="#servicos"
            icon={<ArrowDown strokeWidth={1.6} />}
            variant="outline"
            size="lg"
          />
        </Reveal>
      </div>

      <div className="hero__hint" aria-hidden="true">
        <span>{hero.scrollHint}</span>
        <span className="hero__hint-bars">
          <i />
          <i />
          <i />
        </span>
      </div>
    </section>
  )
}
