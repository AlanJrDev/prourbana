import { Building2, Ruler, Layers, FileCheck2, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { services, type ServiceIconKey } from '@/content/site'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Reveal } from '@/components/motion/Reveal'
import { Marquee } from '@/components/motion/Marquee'

const ICONS: Record<ServiceIconKey, LucideIcon> = {
  building: Building2,
  ruler: Ruler,
  layers: Layers,
  'file-check': FileCheck2,
}

export function Servicos() {
  return (
    <section className="servicos section" id="servicos">
      <div className="container">
        <SectionHeader
          eyebrow={services.eyebrow}
          title={services.title}
          lead={services.lead}
        />

        <div className="servicos__grid">
          {services.items.map((service, i) => {
            const Icon = ICONS[service.icon]
            const featured = 'featured' in service && service.featured === true
            return (
              <Reveal
                key={service.title}
                variant="up"
                delay={i * 0.1}
                className={`card ${featured ? 'card--featured' : ''}`.trim()}
              >
                <div className="card__icon">
                  <Icon aria-hidden="true" strokeWidth={1.35} />
                </div>
                <h3 className="card__title">{service.title}</h3>
                <p className="card__text">{service.description}</p>
                <ul className="card__tags">
                  {service.highlights.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <span className="card__arrow" aria-hidden="true">
                  <ArrowUpRight strokeWidth={1.5} />
                </span>
              </Reveal>
            )
          })}
        </div>
      </div>

      <Marquee className="servicos__marquee" speed={48}>
        {services.items.map((service) => (
          <span key={service.title} className="marquee__item">
            {service.title}
            <i aria-hidden="true" />
          </span>
        ))}
        <span className="marquee__item">
          Regularização fundiária
          <i aria-hidden="true" />
        </span>
      </Marquee>
    </section>
  )
}
