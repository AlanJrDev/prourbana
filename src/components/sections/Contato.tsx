import { contact, whatsapp, whatsappUrl } from '@/content/site'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Reveal } from '@/components/motion/Reveal'
import { ArrowFillButton } from '@/components/ui/ArrowFillButton'
import { MapPin, Clock } from 'lucide-react'

export function Contato() {
  return (
    <section className="contato section" id="contato">
      <div className="container contato__inner">
        <SectionHeader
          eyebrow={contact.eyebrow}
          title={contact.title}
          lead={contact.lead}
          align="center"
          tone="light"
        />

        <Reveal variant="up" delay={0.2} className="contato__actions">
          <ArrowFillButton
            btnText={contact.cta}
            href={whatsappUrl()}
            variant="copper"
            target="_blank"
            rel="noopener noreferrer"
          />
        </Reveal>

        <Reveal variant="fade" delay={0.3} className="contato__meta">
          <span>
            <MapPin aria-hidden="true" strokeWidth={1.6} />
            {contact.availability}
          </span>
          <span>
            <Clock aria-hidden="true" strokeWidth={1.6} />
            Resposta no mesmo dia útil · {whatsapp.display}
          </span>
        </Reveal>
      </div>
    </section>
  )
}
