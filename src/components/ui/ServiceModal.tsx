import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { gsap } from '@/lib/gsapSetup'
import { prefersReducedMotion } from '@/lib/motion'
import { resumeLenis, stopLenis } from '@/lib/lenis'
import { WhatsAppCTA } from '@/components/layout/WhatsAppCTA'
import type { ServiceItem } from '@/content/site'

type Props = {
  service: ServiceItem | null
  onClose: () => void
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal dos cards de Soluções integradas. Papel de diálogo: foco no painel ao
 * abrir, Esc/backdrop para fechar, Tab preso dentro, rolagem travada no Lenis
 * e foco devolvido ao card que abriu.
 */
export function ServiceModal({ service, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const restoreRef = useRef<HTMLElement | null>(null)

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const root = rootRef.current
    const panel = panelRef.current
    if (!root || !panel || prefersReducedMotion()) {
      onClose()
      return
    }
    gsap
      .timeline({ onComplete: onClose })
      .to(panel, { y: 18, scale: 0.97, opacity: 0, duration: 0.26, ease: 'power2.in' }, 0)
      .to(root, { opacity: 0, duration: 0.26, ease: 'power2.in' }, 0.04)
  }, [onClose])

  // entrada: trava a rolagem, anima e leva o foco pro painel
  useEffect(() => {
    if (!service) return
    closingRef.current = false
    restoreRef.current = document.activeElement as HTMLElement | null

    stopLenis()
    document.documentElement.style.overflow = 'hidden'

    const root = rootRef.current
    const panel = panelRef.current
    if (root && panel && !prefersReducedMotion()) {
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      gsap.fromTo(
        panel,
        { y: 26, scale: 0.965, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.04 },
      )
    }
    panel?.focus({ preventScroll: true })

    return () => {
      document.documentElement.style.overflow = ''
      resumeLenis()
      restoreRef.current?.focus?.({ preventScroll: true })
    }
  }, [service])

  // Esc fecha; Tab cicla só dentro do painel
  useEffect(() => {
    if (!service) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [service, requestClose])

  if (!service) return null

  return (
    <div className="svc-modal" ref={rootRef}>
      <div className="svc-modal__backdrop" aria-hidden="true" onClick={requestClose} />
      <div
        className="svc-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="svc-modal-title"
        ref={panelRef}
        tabIndex={-1}
      >
        <button type="button" className="svc-modal__close" onClick={requestClose} aria-label="Fechar">
          <X aria-hidden="true" strokeWidth={1.8} />
        </button>

        {service.image && (
          <img
            className="svc-modal__media"
            src={service.image.src}
            alt={service.image.alt}
            width={1400}
            height={766}
            decoding="async"
          />
        )}

        <div className="svc-modal__body">
          <div className="svc-modal__head">
            <span className="svc-modal__eyebrow">Soluções integradas</span>
            <h3 className="svc-modal__title" id="svc-modal-title">
              {service.title}
            </h3>
            <p className="svc-modal__subtitle">{service.subtitle}</p>
          </div>
          <p className="svc-modal__lead">{service.description}</p>
          <p className="svc-modal__text">{service.detail}</p>

          <span className="card__tags">
            {service.highlights.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>

          <WhatsAppCTA
            className="svc-modal__cta"
            size="md"
            label="Quero falar sobre este serviço"
            message={`Olá! Vim pelo site da ProUrbana e gostaria de saber mais sobre o serviço de ${service.title} (${service.subtitle}).`}
          />
        </div>
      </div>
    </div>
  )
}
