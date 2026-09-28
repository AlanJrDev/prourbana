import { MessageCircle } from 'lucide-react'
import { whatsappUrl, whatsapp } from '@/content/site'
import { InteractiveHoverButton, type HoverButtonVariant } from '@/components/ui/InteractiveHoverButton'

type Props = {
  label?: string
  message?: string
  variant?: HoverButtonVariant
  size?: 'md' | 'lg'
  className?: string
}

/** CTA principal do site. Um <a> de verdade: funciona com teclado e no mobile. */
export function WhatsAppCTA({
  label = 'Falar no WhatsApp',
  message = whatsapp.message,
  variant = 'copper',
  size = 'md',
  className,
}: Props) {
  return (
    <InteractiveHoverButton
      text={label}
      href={whatsappUrl(message)}
      icon={<MessageCircle strokeWidth={1.6} />}
      variant={variant}
      size={size}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    />
  )
}
