import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { whatsapp, whatsappUrl } from '@/content/site'
import { InteractiveHoverButton } from '@/components/ui/InteractiveHoverButton'

/** Rolagem mínima para o FAB aparecer (não polui a hero, que já tem CTA). */
const SHOW_AFTER = 150

/**
 * Botão flutuante de WhatsApp (canto inferior direito): pill verde da marca
 * com anel pulsante — mais chamativo que os botões comuns, mesmo hover.
 * Só existe depois do preloader (o Site monta após o preloader terminar) e
 * só aparece depois da hero, para não colidir com os botões dela.
 */
export function WhatsAppFloat() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > SHOW_AFTER)
    // primeira pintura já com a classe nova → anima a entrada na rolagem
    const id = window.requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <InteractiveHoverButton
      className={`wa-float ${shown ? '' : 'wa-float--off'}`.trim()}
      variant="green"
      size="md"
      text={whatsapp.floatCta}
      icon={<MessageCircle strokeWidth={1.8} />}
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={whatsapp.floatCta}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
    />
  )
}
