import { useState } from 'react'
import { Building2, HardHat, Layers, Map, FileCheck2, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { services, type ServiceIconKey, type ServiceItem } from '@/content/site'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Reveal } from '@/components/motion/Reveal'
import { Marquee } from '@/components/motion/Marquee'
import { ServiceModal } from '@/components/ui/ServiceModal'

const ICONS: Record<ServiceIconKey, LucideIcon> = {
  building: Building2,
  'hard-hat': HardHat,
  layers: Layers,
  map: Map,
  'file-check': FileCheck2,
}

export function Servicos() {
  const [active, setActive] = useState<ServiceItem | null>(null)

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
            const featured = service.featured === true
            return (
              <Reveal
                key={service.title}
                variant="up"
                delay={Math.min(i * 0.08, 0.32)}
                className="servicos__cell"
              >
                <button
                  type="button"
                  className={`card ${featured ? 'card--featured' : ''}`.trim()}
                  aria-haspopup="dialog"
                  onClick={() => setActive(service)}
                >
                  <span className="card__icon">
                    <Icon aria-hidden="true" strokeWidth={1.35} />
                  </span>
                  <span className="card__title">{service.title}</span>
                  <span className="card__text">{service.description}</span>
                  <span className="card__tags">
                    {service.highlights.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                  <span className="card__arrow" aria-hidden="true">
                    <ArrowUpRight strokeWidth={1.5} />
                  </span>
                </button>
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

      <ServiceModal service={active} onClose={() => setActive(null)} />
    </section>
  )
}
