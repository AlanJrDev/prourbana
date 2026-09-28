import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * Botão 21st.dev "Arrow Fill Button" (Hyperiux Vault), portado fielmente para
 * o CSS do projeto (mesmos tempos e easing: 450ms cubic-bezier(0.785,0.135,0.15,0.86)):
 * o círculo da seta à direita expande até cobrir o botão, o texto vira a cor
 * de preenchimento e as setas fazem a troca de entrada/saída.
 * Cores adaptadas à paleta do projeto via classes de variante (.afb--*).
 */

const COMPACT_LAYOUT_BREAKPOINT = 1026
const ANIMATION_DURATION_MS = 450

export type ArrowFillVariant = 'copper' | 'light'

type Props = {
  btnText?: string
  href?: string
  className?: string
  variant?: ArrowFillVariant
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>

export function ArrowFillButton({
  btnText = 'Falar no WhatsApp',
  href = '#',
  className = '',
  variant = 'copper',
  ...props
}: Props) {
  const [isReady, setIsReady] = useState(false)
  const [isCompactLayout, setIsCompactLayout] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const releaseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${COMPACT_LAYOUT_BREAKPOINT - 1}px)`,
    )

    const syncCompactLayout = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches =
        'matches' in event
          ? event.matches
          : (event as unknown as { currentTarget: MediaQueryList }).currentTarget
              .matches
      setIsCompactLayout(matches)
      if (!matches) setIsPressed(false)
    }

    syncCompactLayout(mediaQuery)
    mediaQuery.addEventListener('change', syncCompactLayout)
    return () => mediaQuery.removeEventListener('change', syncCompactLayout)
  }, [])

  useEffect(() => {
    return () => {
      if (releaseTimeoutRef.current) window.clearTimeout(releaseTimeoutRef.current)
    }
  }, [])

  const clearPressedState = () => {
    if (releaseTimeoutRef.current) window.clearTimeout(releaseTimeoutRef.current)
    releaseTimeoutRef.current = window.setTimeout(() => {
      setIsPressed(false)
      releaseTimeoutRef.current = null
    }, ANIMATION_DURATION_MS)
  }

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerDown?.(event)
    if (!isCompactLayout || event.pointerType === 'mouse') return
    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current)
      releaseTimeoutRef.current = null
    }
    setIsPressed(true)
  }

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerUp?.(event)
    if (!isCompactLayout || event.pointerType === 'mouse') return
    clearPressedState()
  }

  const handlePointerCancel = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerCancel?.(event)
    if (!isCompactLayout || event.pointerType === 'mouse') return
    clearPressedState()
  }

  return (
    <a
      href={href}
      {...props}
      data-pressed={isPressed ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`afb afb--${variant} ${className}`.trim()}
      style={
        {
          visibility: isReady ? 'visible' : 'hidden',
        } as CSSProperties
      }
    >
      <span className="afb__label">{btnText}</span>
      <span className="afb__fill" aria-hidden="true" />
      <span className="afb__overlay" aria-hidden="true">
        <span>{btnText}</span>
      </span>
      <span className="afb__circle" aria-hidden="true">
        <ArrowRight className="afb__arrow afb__arrow--in" strokeWidth={1.8} />
        <ArrowRight className="afb__arrow afb__arrow--out" strokeWidth={1.8} />
      </span>
    </a>
  )
}
