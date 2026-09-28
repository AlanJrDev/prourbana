import { proof } from '@/content/site'
import { Reveal } from '@/components/motion/Reveal'
import { SplitHeading } from '@/components/motion/SplitHeading'

export function Prova() {
  return (
    <section className="prova section" id="prova">
      <div className="container">
        <Reveal variant="fade" className="eyebrow eyebrow--light">
          <span className="eyebrow__dot" aria-hidden="true" />
          {proof.eyebrow}
        </Reveal>

        <blockquote className="prova__quote">
          <SplitHeading
            lines={proof.quote}
            as="p"
            className="prova__text"
            start="top 85%"
          />
          <footer className="prova__attribution">
            <span className="prova__rule" aria-hidden="true" />
            {proof.attribution}
          </footer>
        </blockquote>

        <div className="prova__pillars">
          {proof.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} variant="up" delay={i * 0.12} className="pillar">
              <span className="pillar__index">0{i + 1}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
