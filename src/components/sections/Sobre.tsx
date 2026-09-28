import { Check } from 'lucide-react'
import { about } from '@/content/site'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Reveal } from '@/components/motion/Reveal'
import { Counter } from '@/components/motion/Counter'
import { Parallax } from '@/components/motion/Parallax'

export function Sobre() {
  return (
    <section className="sobre section" id="sobre">
      <div className="container">
        <div className="sobre__grid">
          <div className="sobre__text">
            <SectionHeader eyebrow={about.eyebrow} title={about.title} />

            <div className="sobre__body">
              {about.body.map((paragraph, i) => (
                <Reveal key={i} variant="up" delay={0.1 + i * 0.08}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <ul className="sobre__list">
              {about.bullets.map((item, i) => (
                <Reveal as="li" key={item} variant="up" delay={0.24 + i * 0.08}>
                  <Check aria-hidden="true" strokeWidth={2} />
                  <span>{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="sobre__media">
            <Reveal variant="scale" className="sobre__figure">
              <Parallax amount={0.08}>
                <img
                  src={about.image.src}
                  alt={about.image.alt}
                  width={1600}
                  height={1067}
                  loading="lazy"
                  decoding="async"
                />
              </Parallax>
            </Reveal>
            <Reveal variant="up" delay={0.2} className="sobre__caption">
              <span className="sobre__caption-rule" aria-hidden="true" />
              Receptor RTK em levantamento de campo
            </Reveal>
          </div>
        </div>

        <div className="numbers">
          {about.numbers.map((stat, i) => (
            <Reveal key={stat.label} variant="up" delay={i * 0.09} className="numbers__item">
              <span className="numbers__value">
                <Counter to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </span>
              <span className="numbers__label">{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
