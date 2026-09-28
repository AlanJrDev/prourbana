import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * Botão estilo 21st.dev "Interactive Hover Button", portado para o CSS do
 * projeto: ao passar o mouse, o texto desliza pra fora, o texto-fantasma com
 * seta entra da direita e o ponto expande até cobrir o botão.
 * Renderiza <a> quando há href, <button> caso contrário.
 */
export type HoverButtonVariant = 'copper' | 'outline' | 'light' | 'green'

type Props = {
  text: string
  href?: string
  icon?: ReactNode
  variant?: HoverButtonVariant
  size?: 'md' | 'lg'
  className?: string
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'type'>

export function InteractiveHoverButton({
  text,
  href,
  icon,
  variant = 'copper',
  size = 'md',
  className = '',
  ...props
}: Props) {
  const cls = `btn ihb ihb--${variant} btn--${size} ${className}`.trim()

  const inner = (
    <>
      {icon ? (
        <span className="ihb__lead" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ihb__label">
        <span className="ihb__t">{text}</span>
      </span>
      <span className="ihb__ghost" aria-hidden="true">
        <span className="ihb__t">{text}</span>
        <ArrowRight strokeWidth={1.8} />
      </span>
      <i className="ihb__dot" aria-hidden="true" />
    </>
  )

  if (href) {
    return (
      <a className={cls} href={href} {...props}>
        {inner}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {inner}
    </button>
  )
}
