/**
 * Fonte única de verdade do conteúdo do site.
 * Editar textos, telefone e âncores aqui — nenhum componente precisa ser alterado.
 */

export const brand = {
  name: 'Prourbana',
  legalName: 'Prourbana Projetos e Consultoria Ltda',
  monogram: '/brand/logo.png',
  wordmark: '/brand/letreiro.png',
  wordmarkDark: '/brand/letreiro-dark.png',
  /** faixa "Arquitetura • Urbanismo • Topografia • Georreferenciamento" —
   *  entra SÓ sob o letreiro da logo grande do hero, na animação de load e
   *  no rodapé. O header fixo mantém apenas monograma + letreiro. */
  strip: '/images/brand-strip.webp',
  tagline: 'Soluções técnicas em projetos, topografia e regularização para imóveis, propriedades e empreendimentos.',
} as const

/**
 * Mídia dos dois destaques.
 *  - hero: o vídeo toca sozinho (loop nativo, exibição — sem scrub de rolagem);
 *  - rural: loop nativo igual ao hero.
 */
export const media = {
  hero: {
    // desktop/tablet: paisagem 1280×720 — só os últimos 4s do original,
    // loop nativo de 4s (96 quadros)
    src: '/video/hero.mp4?v=3',
    poster: '/video/hero-poster.webp',
    // celular (≤620px): somente os últimos 4s do original (4,0–8,0s —
    // só o drone já voando), loop nativo; 1,35 MB
    srcMobile: '/video/hero-drone.mp4',
    posterMobile: '/video/hero-drone-poster.webp',
  },
  rural: {
    src: '/video/rural.mp4',
    poster: '/video/rural-poster.webp',
  },
} as const

/** Formato internacional: 55 + DDD + número. */
export const whatsapp = {
  phone: '556139746421',
  display: '(61) 3974-6421',
  message:
    'Olá! Vim pelo site da ProUrbana e gostaria de solicitar uma orientação/orçamento. Meu serviço é relacionado a: ______.',
  /** rótulo do botão flutuante (canto inferior direito) */
  floatCta: 'Falar no WhatsApp',
} as const

export const whatsappUrl = (msg: string = whatsapp.message) =>
  `https://wa.me/${whatsapp.phone}?text=${encodeURIComponent(msg)}`

export const nav = [
  { label: 'Início', href: '#topo' },
  { label: 'Soluções', href: '#servicos' },
  { label: 'Regularização', href: '#rural' },
  { label: 'Projetos', href: '#portfolio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
] as const

export const hero = {
  /** h1 — fica sr-only em todas as telas (SEO/leitores) */
  title: ['Do terreno ao projeto.', 'Do projeto à regularização.'],
  /** frase principal — visível em todas as telas */
  short: 'Do terreno ao projeto. Do projeto à regularização.',
  /** subtítulo — visível em todos os formatos, acima dos botões */
  sub: 'Soluções técnicas para imóveis, terrenos, obras e empreendimentos — com precisão, responsabilidade e acompanhamento em cada etapa.',
  primaryCta: 'Falar com a Prourbana',
  secondaryCta: 'Conhecer soluções',
  scrollHint: 'Role para explorar',
} as const

export const about = {
  eyebrow: 'Engenharia que dá segurança à decisão',
  title: ['Precisão técnica começa', 'antes da execução.'],
  body: [
    'Um levantamento incorreto, uma documentação incompleta ou uma implantação mal executada podem gerar retrabalho, atrasos e custos desnecessários. Na ProUrbana, cada projeto começa pela compreensão da necessidade do cliente e segue com levantamentos precisos, análise técnica e acompanhamento em todas as etapas necessárias.',
    'Da medição em campo à entrega da documentação, trabalhamos para que você tenha clareza, segurança e confiança para seguir adiante.',
  ],
  bullets: [
    'Levantamentos realizados com equipamentos e metodologia adequados a cada projeto.',
    'Projetos desenvolvidos de acordo com as características reais do imóvel e do terreno.',
    'Acompanhamento técnico durante as etapas necessárias do serviço.',
  ],
  image: { src: '/images/rtk.webp', alt: 'Topógrafo com receptor RTK em campo ao entardecer' },
  numbers: [
    { value: 1, prefix: '±', suffix: ' cm', label: 'Precisão em campo' },
    { value: 10, prefix: '', suffix: '+', label: 'Anos de experiência' },
    { value: 13133, prefix: 'NBR ', suffix: '', label: 'Padrão técnico' },
    { value: 4, prefix: '', suffix: '', label: 'Frentes de solução' },
  ],
} as const

export type ServiceIconKey = 'building' | 'hard-hat' | 'layers' | 'map' | 'file-check'

export type ServiceItem = {
  icon: ServiceIconKey
  title: string
  /** linha curta — só aparece no modal */
  subtitle: string
  description: string
  /** texto ampliado — só aparece no modal */
  detail: string
  highlights: string[]
  /** imagem exibida no topo do modal */
  image?: { src: string; alt: string }
  featured?: boolean
}

export const services: { eyebrow: string; title: string[]; lead: string; items: ServiceItem[] } = {
  eyebrow: 'Soluções integradas',
  title: ['Uma equipe para diferentes', 'etapas do seu projeto.'],
  lead: 'Do levantamento do terreno à documentação final, reunimos conhecimento técnico para reduzir retrabalho, facilitar decisões e tornar o processo mais seguro para o cliente.',
  items: [
    {
      icon: 'building',
      title: 'Projetos',
      subtitle: 'Arquitetura e urbanismo',
      description:
        'Soluções de arquitetura, urbanismo e engenharia desenvolvidas de acordo com a realidade do terreno, do imóvel e do objetivo do cliente.',
      detail:
        'Desenvolvemos estudos, projetos e documentação técnica partindo da leitura real do terreno e do objetivo de quem vai usar o espaço. Cada entrega considera viabilidade, normas vigentes e o que será necessário para aprovar e executar.',
      highlights: ['Arquitetura', 'Urbanismo', 'Terraplenagem / Pavimentação', 'Instalações / Estudos'],
      image: {
        src: '/images/service-prancha.webp',
        alt: 'Prancha de projeto urbano sustentável com masterplan, cortes e perspectivas',
      },
    },
    {
      icon: 'hard-hat',
      title: 'Locação',
      subtitle: 'Implantação em campo',
      description:
        'Transposição do projeto para o terreno, com conferência de eixos, níveis e dimensões antes de cada etapa de execução.',
      detail:
        'A locação define no terreno exatamente onde cada elemento será construído. Conferimos referências, eixos e níveis para que a obra avance sem retrabalho e dentro do que foi projetado.',
      highlights: ['Obras Civis', 'Terraplenagem / Pavimentação', 'Redes de água, esgoto e drenagem'],
      image: {
        src: '/images/rtk.webp',
        alt: 'Topógrafo com receptor RTK em campo ao entardecer',
      },
    },
    {
      icon: 'layers',
      title: 'As-Built',
      subtitle: 'Registro do executado',
      description:
        'Levantamento do que foi de fato construído, para conferência, memorial e documentação final da obra.',
      detail:
        'O as-built registra as diferenças entre o projeto e a execução. É ele que garante que a documentação final descreva o que existe de fato no terreno.',
      highlights: ['Obras Civis', 'Esgoto sanitário / Drenagem pluvial'],
      image: {
        src: '/images/service-asbuilt.webp',
        alt: 'Edifício comercial executado visto da esquina',
      },
    },
    {
      icon: 'map',
      title: 'Levantamentos',
      subtitle: 'Planialtimétricos e cadastrais',
      description:
        'Informações precisas sobre terreno, edificações e áreas existentes para dar segurança a projetos, obras, regularizações e decisões técnicas.',
      detail:
        'Escolhemos a metodologia conforme a escala e a precisão exigidas: convencional com uso de estações totais, convencional com uso de GNSS RTK e aerofotogramétrico com uso de drone e scanner laser (LiDAR).',
      highlights: ['Estações Totais', 'GNSS RTK', 'Drone + LiDAR'],
      image: {
        src: '/images/service-levantamento.webp',
        alt: 'Prancha de implantação cotada com eixos, níveis e áreas',
      },
    },
    {
      icon: 'file-check',
      title: 'Regularização',
      subtitle: 'Imóveis urbanos e rurais',
      featured: true,
      description:
        'Apoio técnico para organizar, corrigir e conduzir processos de regularização de imóveis e propriedades urbanas ou rurais.',
      detail:
        'Acompanhamos as etapas técnicas do processo — do levantamento à documentação — junto aos sistemas e órgãos envolvidos, para que o proprietário saiba sempre o que já foi feito e qual é o próximo passo.',
      highlights: [
        'Imóveis urbanos',
        'Imóveis rurais',
        'Desmembramento / Remembramento',
        'Georreferenciamento / Documentação',
      ],
      image: {
        src: '/images/service-regularizacao.webp',
        alt: 'Equipe em vistoria de regularização de matrícula urbana e rural',
      },
    },
  ],
}

export const rural = {
  eyebrow: 'Regularização rural',
  title: ['Sua propriedade rural regularizada', 'do campo ao cartório.'],
  lead: 'Georreferenciamento, levantamentos e suporte técnico para proprietários que precisam organizar a documentação, adequar a propriedade e avançar no processo de regularização. A ProUrbana acompanha as etapas técnicas necessárias junto aos sistemas e órgãos envolvidos, tornando o processo mais claro e seguro para o proprietário.',
  chips: ['INCRA', 'SIGEF', 'Georreferenciamento', 'Retificação', 'Desmembramento'],
  cta: 'Quero regularizar minha propriedade',
} as const

export const portfolio = {
  eyebrow: 'Trabalhos realizados',
  title: ['Projetos que', 'saíram do papel.'],
  lead: 'Conheça alguns dos trabalhos desenvolvidos pela ProUrbana em levantamentos, projetos, obras e regularização.',
  items: [
    { src: '/images/portfolio-01.webp', title: 'Regularização de matrícula — vistoria e georreferenciamento', tag: 'Regularização' },
    { src: '/images/portfolio-10.webp', title: 'Urbanização — estudo de implantação', tag: 'Urbanismo' },
    { src: '/images/portfolio-13.webp', title: 'Distrito logístico — estudo aéreo de implantação', tag: 'Urbanismo' },
    { src: '/images/portfolio-06.webp', title: 'Edifício comercial — implantação noturna', tag: 'Arquitetura' },
    { src: '/images/portfolio-11.webp', title: 'Levantamento cadastral — implantação cotada', tag: 'Levantamentos' },
    { src: '/images/portfolio-09.webp', title: 'Edifício residencial — pavimento tipo', tag: 'Arquitetura' },
    { src: '/images/portfolio-12.webp', title: 'Viaduto Itapoá — projeto executivo', tag: 'Topografia' },
    { src: '/images/portfolio-08.webp', title: 'Loteamento — projeto de implantação', tag: 'Urbanismo' },
  ],
} as const

export const proof = {
  eyebrow: 'Mais do que entregar um projeto',
  quote: [
    'Técnica gera precisão. Proximidade gera confiança.',
    'Existe uma decisão importante por trás de quem nos procura. Por isso, nosso trabalho começa entendendo o problema do cliente e termina quando ele sabe exatamente o que foi feito e qual é o próximo passo.',
  ],
  attribution: 'Diagnóstico interno · Prourbana Projetos e Consultoria',
  pillars: [
    {
      title: 'Precisão',
      body: 'Dados confiáveis para que projetos, obras e decisões sejam tomadas sobre informações técnicas consistentes.',
    },
    {
      title: 'Confiança',
      body: 'Comunicação clara sobre etapas, necessidades e caminhos possíveis durante a execução do serviço.',
    },
    {
      title: 'Dedicação',
      body: 'Acompanhamento próximo e atenção aos detalhes do início à conclusão de cada trabalho.',
    },
  ],
} as const

export const contact = {
  eyebrow: 'Fale com a Prourbana',
  title: ['Conte para a gente', 'o que você precisa resolver.'],
  lead: 'Precisa de levantamento, projeto, locação de obra ou regularização? Envie sua necessidade para nossa equipe. Vamos entender o seu caso e orientar você sobre o serviço adequado e os próximos passos.',
  cta: 'Falar com nossa equipe',
  availability:
    'Atendimento direto pelo WhatsApp · Projetos urbanos • Projetos rurais • Empresas • Proprietários • Empreendimentos',
  address: 'Guará II — SRIA II (Polo de Moda) · Brasília/DF · CEP 71070-505',
  mapsEmbed:
    'https://www.google.com/maps?q=-15.8474636,-47.9798927&hl=pt-BR&z=17&output=embed',
  mapsUrl:
    'https://www.google.com/maps/place/ProUrbana/@-15.8474636,-47.9824676,17z/data=!3m1!4b1!4m6!3m5!1s0x935a2ff4521c26bb:0xff90511757f8b6f!8m2!3d-15.8474636!4d-47.9798927!16s%2Fg%2F11w39_dpkh?hl=pt-BR&entry=ttu',
} as const

export const footer = {
  columns: [
    {
      title: 'Soluções',
      items: [
        'Arquitetura e Urbanismo',
        'Levantamentos Topográficos',
        'As-Built',
        'Locação de Obras',
        'Regularização Urbana',
        'Regularização Rural',
        'Georreferenciamento',
      ],
    },
    {
      title: 'Atendimento',
      items: ['Brasília — DF', 'Goiás', 'Minas Gerais', 'Outras localidades sob consulta'],
    },
    {
      title: 'Contato',
      items: ['WhatsApp', 'E-mail', 'Instagram'],
    },
  ],
  legal: 'Prourbana Projetos e Consultoria Ltda — CNPJ 17.949.228/0001-25',
  rights: `© ${new Date().getFullYear()} ProUrbana Projetos e Consultoria Ltda. Todos os direitos reservados.`,
} as const
