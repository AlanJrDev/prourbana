import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { brand, contact, footer, nav, whatsapp } from '@/content/site'
import { scrollToSection, scrollToTop } from '@/lib/lenis'

export function Footer() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <img src={brand.monogram} alt="" width={72} height={72} className="footer__mark" decoding="async" />
          <img src={brand.wordmark} alt="Prourbana" className="footer__wordmark" decoding="async" />
          <p className="footer__tagline">{brand.tagline}</p>
        </div>

        <nav className="footer__columns" aria-label="Rodapé">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer__areas">
          <h3>Áreas de atendimento</h3>
          <ul>
            {footer.areas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
          <p className="footer__availability">{contact.availability}</p>
        </div>
      </div>

      <div className="footer__nav container">
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.href)
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="footer__legal">{footer.legal}</span>
      </div>

      <div className="footer__bottom container">
        <span>{footer.rights}</span>
        <a
          className="footer__phone"
          href={`https://wa.me/${whatsapp.phone}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp {whatsapp.display}
        </a>
      </div>

      <button
        type="button"
        className={`to-top ${showTop ? 'to-top--show' : ''}`.trim()}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        <ArrowUp aria-hidden="true" strokeWidth={1.8} />
      </button>
    </footer>
  )
}
