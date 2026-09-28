import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsapSetup'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { Hero } from '@/components/sections/Hero'
import { Sobre } from '@/components/sections/Sobre'
import { Servicos } from '@/components/sections/Servicos'
import { Rural } from '@/components/sections/Rural'
import { Portfolio } from '@/components/sections/Portfolio'
import { Prova } from '@/components/sections/Prova'
import { Contato } from '@/components/sections/Contato'

export function Site() {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 240)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <a className="skip-link" href="#sobre">
        Pular para o conteúdo
      </a>
      <Nav />
      <main>
        <Hero />
        <Sobre />
        <Servicos />
        <Rural />
        <Portfolio />
        <Prova />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
