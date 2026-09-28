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
  tagline: 'Projetos que se veem do alto',
} as const

/**
 * Mídia dos dois destaques.
 *  - hero: o vídeo toca sozinho (loop nativo, exibição — sem scrub de rolagem);
 *  - rural: ping-pong contínuo; freezeAt é o instante congelado em reduced motion.
 */
export const media = {
  hero: {
    // desktop/tablet: paisagem 1280×720
    src: '/video/hero.mp4',
    poster: '/video/hero-poster.webp',
    // celular (≤620px): somente os últimos 4s do original (4,0–8,0s —
    // só o drone já voando), loop nativo; 1,35 MB
    srcMobile: '/video/hero-drone.mp4',
    posterMobile: '/video/hero-drone-poster.webp',
  },
  rural: {
    src: '/video/rural.mp4',
    poster: '/video/rural-poster.webp',
    freezeAt: 4,
  },
} as const

/** Formato internacional: 55 + DDD + número. Trocar quando o número real for confirmado. */
export const whatsapp = {
  phone: '5500000000000',
  display: '(00) 00000-0000',
  message: 'Olá! Vim pelo site da Prourbana e gostaria de um orçamento.',
  /** rótulo do botão flutuante (canto inferior direito) */
  floatCta: 'Fale no WhatsApp',
} as const

export const whatsappUrl = (msg: string = whatsapp.message) =>
  `https://wa.me/${whatsapp.phone}?text=${encodeURIComponent(msg)}`

export const nav = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Regularização', href: '#rural' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Contato', href: '#contato' },
] as const

export const hero = {
  /** h1 — fica sr-only em todas as telas (SEO/leitores) */
  title: ['Projetos que', 'se veem do alto'],
  /** frase principal — único texto visível da hero em desktop/tablet */
  short: 'Arquitetura, Urbanismo e Topografia',
  /** subtítulo — aparece só no celular (≤620px) */
  sub: 'Planejamento, precisão e visão para o futuro.',
  primaryCta: 'Falar no WhatsApp',
  secondaryCta: 'Ver serviços',
  scrollHint: 'Role para explorar',
} as const

export const about = {
  eyebrow: 'Quem somos',
  title: ['Precisão, confiança', 'e dedicação ao cliente.'],
  body: [
    'Somos a Prourbana Projetos e Consultoria: topografia, arquitetura e regularização fundiária conduzidas pelo mesmo time, do primeiro levantamento de campo até a escritura lavrada.',
    'O cliente que nos procura e senta à mesa com nosso arquiteto fecha contrato em 90% dos casos — e, na maioria das vezes, continua conosco no próximo projeto.',
  ],
  bullets: [
    'Atendemos pessoas físicas e jurídicas: construtoras, advogados, arquitetos, engenheiros e proprietários de terra.',
    'Proposta detalhada, com reajuste negociado caso o escopo mude.',
    'Do campo ao cartório: uma única responsável por toda a jornada.',
  ],
  image: { src: '/images/rtk.webp', alt: 'Topógrafo com receptor RTK em campo ao entardecer' },
  numbers: [
    { value: 240, prefix: '+', suffix: '', label: 'Projetos e levantamentos' },
    { value: 3, prefix: '', suffix: '', label: 'Estados de atuação' },
    { value: 30, prefix: 'R$ ', suffix: ' mil', label: 'Ticket médio por serviço' },
    { value: 90, prefix: '', suffix: '%', label: 'Fechamento em reunião' },
  ],
} as const

export const services = {
  eyebrow: 'O que fazemos',
  title: ['Quatro frentes,', 'um único contrato.'],
  lead: 'Do projeto à regularização, tudo conduzido pela mesma equipe técnica.',
  items: [
    {
      icon: 'building',
      title: 'Projetos',
      description:
        'Arquitetura, urbanismo e REURB, sinalização viária, infraestrutura urbana, terraplenagem e pavimentação e instalações prediais.',
      highlights: ['Arquitetura', 'Urbanismo / REURB', 'Infraestrutura', 'Terraplenagem'],
    },
    {
      icon: 'ruler',
      title: 'Levantamentos',
      description:
        'Planialtimétrico e cadastral convencional por RTK e estação total, aerofotogrametria e scan laser, com georreferenciamento de imóveis rurais.',
      highlights: ['RTK', 'Estação total', 'Aerofotogrametria', 'Scan laser'],
    },
    {
      icon: 'layers',
      title: 'As-Built & Locação',
      description:
        'Acompanhamento topográfico e locação de obras: fundações, redes de drenagem, esgoto sanitário e água potável — com registro as-built.',
      highlights: ['Drenagem', 'Esgoto', 'Água potável', 'Fundações'],
    },
    {
      icon: 'file-check',
      title: 'Regularização',
      featured: true,
      description:
        'Regularização de imóveis rurais e urbanos de ponta a ponta: especialização de matrículas, georreferenciamento, retificação, CAR e protocolos no INCRA, SIGEF e cartório.',
      highlights: ['INCRA', 'SIGEF', 'Cartório', 'CAR'],
    },
  ],
} as const

export const rural = {
  eyebrow: 'Regularização fundiária',
  title: ['Sua terra, regularizada', 'do jeito certo.'],
  lead: 'Especialização de matrículas, georreferenciamento INCRA e SIGEF e toda a parte cartorial — em um único contrato, com acompanhamento do primeiro levantamento até a matrícula retificada.',
  chips: ['INCRA', 'SIGEF', 'Cartório'],
  cta: 'Regularizar meu imóvel',
} as const

export const portfolio = {
  eyebrow: 'Portfólio',
  title: ['Projetos entregues', 'em detalhe.'],
  lead: 'Estudos, projetos e visualizações que viram obra — do residencial ao comercial.',
  items: [
    { src: '/images/portfolio-01.webp', title: 'Regularização de matrícula — vistoria e georreferenciamento', tag: 'Regularização' },
    { src: '/images/portfolio-02.webp', title: 'Banheiro — projetação hidrossanitária', tag: 'Instalações' },
    { src: '/images/portfolio-03.webp', title: 'Suíte — forro e iluminação indireta', tag: 'Projetos' },
    { src: '/images/portfolio-04.webp', title: 'Cozinha integrada — marcenaria e iluminação', tag: 'Interiores' },
    { src: '/images/portfolio-05.webp', title: 'Edifício comercial — estudo de fachada', tag: 'Urbanismo' },
    { src: '/images/portfolio-06.webp', title: 'Edifício comercial — implantação noturna', tag: 'Arquitetura' },
    { src: '/images/portfolio-07.webp', title: 'Suíte master — detalhamento residencial', tag: 'Arquitetura' },
  ],
} as const

export const proof = {
  eyebrow: 'Por que a Prourbana',
  quote: [
    'Precisão, confiança e dedicação ao cliente.',
    'O cliente que nos procura e vem a uma reunião presencial fecha contrato em 90% dos casos — e termina tendo muita amizade com a equipe.',
  ],
  attribution: 'Diagnóstico interno · Prourbana Projetos e Consultoria',
  pillars: [
    {
      title: 'Precisão',
      body: 'RTK, estação total, aerofotogrametria e scan laser: cada projeto nasce de dado medido em campo, não de estimativa.',
    },
    {
      title: 'Confiança',
      body: 'Escopo, prazo e valor em proposta escrita. Se o escopo mudar, renegociamos com você antes de qualquer cobrança.',
    },
    {
      title: 'Dedicação',
      body: 'Um único ponto de contato do levantamento à matrícula — e um arquiteto que atende a reunião pessoalmente.',
    },
  ],
} as const

export const contact = {
  eyebrow: 'Vamos começar',
  title: ['Solicite sua', 'proposta.'],
  lead: 'Conte o que você precisa — levantamento, projeto ou regularização — e devolvemos uma proposta com escopo, prazo e valor.',
  cta: 'Falar no WhatsApp',
  availability: 'Atendimento presencial em Brasília e região · serviços remotos em todo o Brasil',
} as const

export const footer = {
  areas: ['Brasília — DF', 'Goiás', 'Minas Gerais', 'Brasil todo (remoto)'],
  columns: [
    {
      title: 'Projetos',
      items: [
        'Arquitetura',
        'Urbanismo / REURB',
        'Infraestrutura urbana',
        'Terraplenagem e pavimentação',
        'Sinalização viária',
      ],
    },
    {
      title: 'Levantamentos',
      items: [
        'Planialtimétrico e cadastral',
        'RTK e estação total',
        'Aerofotogrametria e scan laser',
        'Georreferenciamento',
        'Acompanhamento de obras',
      ],
    },
    {
      title: 'Regularização',
      items: [
        'Matrículas rurais e urbanas',
        'Especialização (Provimento 2)',
        'Retificação de matrículas',
        'CAR',
        'INCRA · SIGEF · Cartório',
      ],
    },
  ],
  legal: 'Prourbana Projetos e Consultoria Ltda — CNPJ a informar',
  rights: `© ${new Date().getFullYear()} Prourbana. Todos os direitos reservados.`,
} as const

export type ServiceIconKey = (typeof services.items)[number]['icon']
