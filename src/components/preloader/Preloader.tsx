import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { brand } from '@/content/site'
import { InteractiveHoverButton } from '@/components/ui/InteractiveHoverButton'

type Props = {
  progress: number
  status: 'loading' | 'ready' | 'error'
  onDone: () => void
  onRetry: () => void
}

const percent = (value: number) => Math.round(Math.min(1, Math.max(0, value)) * 100)

/**
 * Tela de carregamento: só libera a página quando os bytes críticos
 * (vídeo do hero, pôster e marca) estiverem no cliente.
 */
export function Preloader({ progress, status, onDone, onRetry }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(false)

  // barra e número acompanham o progresso real com suavização
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${percent(progress)}%`,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      })
    }
    if (numRef.current) {
      const state = { v: Number(numRef.current.dataset.value ?? '0') }
      gsap.to(state, {
        v: percent(progress),
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: () => {
          if (!numRef.current) return
          const rounded = Math.round(state.v)
          numRef.current.dataset.value = String(rounded)
          numRef.current.textContent = String(rounded).padStart(2, '0')
        },
      })
    }
  }, [progress])

  // saída
  useEffect(() => {
    if (status !== 'ready' || doneRef.current || !rootRef.current) return
    doneRef.current = true
    const root = rootRef.current
    const tl = gsap.timeline({
      onComplete: () => onDone(),
    })
    tl.to('.preloader__inner', {
      opacity: 0,
      y: -24,
      duration: 0.45,
      ease: 'power2.in',
    }).to(
      root,
      {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.85,
        ease: 'power4.inOut',
      },
      '-=0.15',
    )
  }, [status, onDone])

  // trava a rolagem enquanto carrega
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  const failed = status === 'error'

  return (
    <div className="preloader" ref={rootRef} role="status" aria-live="polite">
      <div className="preloader__inner">
        <div className="preloader__mark">
          <svg className="preloader__rings" viewBox="0 0 200 200" aria-hidden="true">
            <circle className="preloader__ring preloader__ring--a" cx="100" cy="100" r="78" />
            <circle className="preloader__ring preloader__ring--b" cx="100" cy="100" r="64" />
            <circle className="preloader__ring preloader__ring--c" cx="100" cy="100" r="50" />
          </svg>
          <img src={brand.monogram} alt="" className="preloader__logo" />
        </div>

        <img src={brand.wordmark} alt="Prourbana" className="preloader__wordmark" />

        <div className="preloader__meter">
          <span className="preloader__bar" ref={barRef} style={{ width: '0%' }} />
        </div>

        <div className="preloader__meta">
          <span className="preloader__label">
            {failed ? 'Não foi possível carregar' : 'Carregando vídeo e identidade'}
          </span>
          <span className="preloader__percent" ref={numRef} data-value="0">
            00
          </span>
        </div>

        {failed && (
          <InteractiveHoverButton
            text="Tentar novamente"
            variant="copper"
            className="preloader__retry"
            onClick={onRetry}
          />
        )}
      </div>
    </div>
  )
}
