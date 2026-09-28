import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { brand, nav, whatsapp } from '@/content/site'
import { scrollToSection } from '@/lib/lenis'
import { WhatsAppCTA } from './WhatsAppCTA'

/** Distância de rolagem em que o header assume a posição no topo (px). */
const TOP_EXIT = 140

/** Nav fixa: escondida no topo (a logo grande da hero manda), aparece ao rolar,
 *  some ao descer além de 260px e volta ao subir, com barra de leitura em cobre. */
export function Nav() {
  const [hidden, setHidden] = useState(true)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)
  const firstScroll = useRef(true)
  const accDown = useRef(0)
  const accUp = useRef(0)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 40)
      const delta = y - lastY.current
      const first = firstScroll.current
      if (first) firstScroll.current = false
      if (first && y >= TOP_EXIT) {
        // página aberta já rolada (link âncora/restauração): header visível;
        // as regras normais só voltam a valer no próximo evento de rolagem
        setHidden(false)
        accDown.current = 0
        accUp.current = 0
      } else if (y < TOP_EXIT) {
        setHidden(true)
        accDown.current = 0
        accUp.current = 0
      } else {
        // acumulador de intenção: no touch o Lenis emite micro-passos de
        // 1–6px, então decide por distância contínua (40px), não por evento
        if (delta > 1) {
          accUp.current = 0
          accDown.current = Math.min(60, accDown.current + delta)
        } else if (delta < -1) {
          accDown.current = 0
          accUp.current = Math.min(60, accUp.current - delta)
        }
        if (accDown.current >= 40) setHidden(true)
        else if (accUp.current >= 40) setHidden(false)
      }
      lastY.current = y

      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? y / max : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    scrollToSection(href)
  }

  return (
    <>
      <header
        className={`nav ${solid ? 'nav--solid' : ''} ${hidden ? 'nav--hidden' : ''}`.trim()}
      >
        <span className="nav__progress" aria-hidden="true">
          <span ref={barRef} />
        </span>

        <a className="nav__brand" href="#topo" onClick={(e) => { e.preventDefault(); go('#topo') }}>
          <img src={brand.monogram} alt="" width={34} height={34} decoding="async" />
          <img src={brand.wordmark} alt="Prourbana" className="nav__wordmark" decoding="async" />
        </a>

        <nav className="nav__links" aria-label="Seções da página">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                go(item.href)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <span className="nav__phone">{whatsapp.display}</span>
          <WhatsAppCTA className="nav__cta" size="md" label="WhatsApp" />
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className={`nav-sheet ${open ? 'nav-sheet--open' : ''}`.trim()}>
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(item.href)
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <WhatsAppCTA size="lg" label="Falar no WhatsApp" />
      </div>
    </>
  )
}
