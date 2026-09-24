# PROURBANA — Projetos e Consultoria

Landing page institucional da **PROURBANA**: topografia, regularização fundiária e urbanismo. Site estático com **Vite** (vanilla HTML/CSS/JS modular), sem framework e sem backend.

**Repositório:** [github.com/AlanJrDev/prourbana](https://github.com/AlanJrDev/prourbana)

---

## Sumário

- [Sobre](#sobre)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar localmente](#como-executar-localmente)
- [Como publicar (GitHub Pages)](#como-publicar-github-pages)
- [Personalização](#personalização)
  - [Número do WhatsApp](#número-do-whatsapp)
  - [Depoimentos](#depoimentos)
  - [Textos e seções](#textos-e-seções)
  - [Tema claro e escuro](#tema-claro-e-escuro)
  - [Vídeo do hero](#vídeo-do-hero)
- [Recursos da página](#recursos-da-página)
- [Tecnologias](#tecnologias)
- [Estrutura das seções](#estrutura-das-seções)
- [Acessibilidade](#acessibilidade)
- [Licença de mídia](#licença-de-mídia)
- [Contato](#contato)

---

## Sobre

A PROURBANA une precisão de campo (drone, GPS RTK, normas ABNT/INCRA) a um atendimento orientado pelo problema do cliente: escritura, divisas, loteamento ou obra. A página apresenta as quatro frentes de serviço, o fluxo de atendimento, diferenciais técnicos e FAQ, com conversão via WhatsApp.

Público-alvo:

- **Proprietários** de imóveis e terrenos que precisam regularizar, dividir ou vender sem pendências.
- **Engenheiros, arquitetos e construtoras** que precisam de levantamento topográfico confiável.
- **Investidores** que avaliam conformidade de áreas.

---

## Estrutura do projeto

```
prourban/
├── index.html                 # Markup (entra no build)
├── package.json               # Scripts npm + devDependency: vite
├── vite.config.js             # Config do bundler (base: "./")
├── public/
│   └── assets/                # Estáticos servidos sem transformação
│       ├── hero-drone.mp4     # Vídeo de fundo do hero (boomerang)
│       ├── hero-poster.jpg    # Frame estático / fallback do vídeo
│       ├── prourban-mark.png  # Monograma (nav)
│       ├── prourban-logo-full.png
│       └── prourban-logo.jpeg
├── src/
│   ├── main.js                # Entrada: importa CSS + inicializa módulos
│   ├── styles/
│   │   ├── main.css           # Importa os módulos de estilo
│   │   ├── tokens.css         # @property, OKLch, temas claro/escuro
│   │   ├── base.css           # Reset, tipografia, utilitários, seções shared
│   │   ├── nav.css            # Header e menu mobile
│   │   ├── buttons.css        # Botões
│   │   ├── hero.css           # Hero, vídeo e curvas
│   │   ├── sections.css       # Bento, timeline, prova/FAQ, CTA, footer
│   │   ├── motion.css         # Entradas, reveals, theme-toggle
│   │   └── responsive.css     # Breakpoints
│   └── scripts/
│       ├── nav.js             # Scroll, menu mobile, ano do rodapé
│       ├── theme.js           # Toggle de tema + View Transitions
│       ├── hero-video.js      # Boomerang do vídeo
│       └── reveal.js          # IntersectionObserver
├── media/frames/              # Frames originais do drone (fonte do vídeo)
├── .github/workflows/         # Deploy automático no GitHub Pages
├── .gitignore
└── README.md
```

---

## Como executar localmente

Requisitos: **Node.js 18+**.

```bash
npm install --include=dev
npm run dev
```

Abra a URL que o Vite imprimir (normalmente `http://localhost:5173`).

Scripts disponíveis:

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente |

---

## Como publicar (GitHub Pages)

O workflow **Deploy** em `.github/workflows/deploy.yml` faz o build e publica o `dist/` automaticamente a cada push em `main`.

1. No GitHub: **Settings → Pages → Source → GitHub Actions**.
2. Push em `main`.

Alternativa manual (sem Actions): `npm run build` e publique a pasta `dist/` (por exemplo, na branch `gh-pages`).

Site esperado: `https://alanjrdev.github.io/prourbana/`.

---

## Personalização

### Número do WhatsApp

Todos os CTAs apontam para `https://wa.me/5511999999999?text=...`. Para colocar o número real:

1. Formate: `55` + DDD + número (ex.: `5511987654321`).
2. Substitua **todas** as ocorrências de `5511999999999` em `index.html`.

Há links em:

- Nav (botão *WhatsApp*)
- Hero (CTA primário)
- CTA final (*Solicitar Orçamento Gratuito*)
- Rodapé (*Falar no WhatsApp*)

### Depoimentos

Os três cards de depoimento estão rotulados como **“Depoimento de exemplo”** de propósito — nenhum nome ou citação foi inventado. Substitua o texto de cada `<blockquote>` e o `<figcaption>` pelos depoimentos reais e remova o `<span class="quote__badge">` quando saírem de exemplo.

### Textos e seções

Todo o conteúdo em português está no próprio `index.html`. IDs de âncora:

| Âncora | Seção |
|--------|--------|
| `#topo` | Início / nav |
| `#solucoes` | Frentes de atuação (bento) |
| `#tecnologia` | Diferencial técnico |
| `#como-funciona` | Fluxo em 4 etapas |
| `#publico` | Para quem trabalhamos |
| `#faq` | Depoimentos + FAQ |
| `#contato` | CTA final |

### Tema claro e escuro

- Botão flutuante no canto inferior direito alterna o tema.
- Preferência salva em `localStorage` (`prourban-theme`).
- Padrão: **claro**.
- Tokens de cor em OKLch em `src/styles/tokens.css` (`:root` e `:root[data-theme="light"]`).

### Vídeo do hero

- Arquivo: `public/assets/hero-drone.mp4` (mudo, `playsinline`).
- Comportamento **boomerang** em `src/scripts/hero-video.js`: toca até o fim, reverte até o início e recomeça.
- Fallback: `public/assets/hero-poster.jpg` enquanto o vídeo não inicia.
- Em `prefers-reduced-motion: reduce` o autoplay é desativado.

Para trocar o clipe, substitua o MP4 mantendo o mesmo caminho (ou atualize o `src` no `<video>`).

---

## Recursos da página

- Hero full-bleed com vídeo drone, curvas de nível animadas e CTAs
- Tema claro/escuro com transição circular (View Transitions) e fallback
- Header com fundo sólido (claro e escuro)
- Grid Bento com as quatro soluções
- Timeline de atendimento em 4 passos
- FAQ em acordeão (`<details>`)
- Navegação âncora com menu mobile
- Skip link e foco visível
- Reveals on scroll (IntersectionObserver)
- Layout responsivo (desktop, tablet, mobile)

---

## Tecnologias

| Camada | Escolha |
|--------|---------|
| Build / dev server | Vite 6 |
| Markup | HTML5 semântico |
| Estilo | CSS modular (custom properties, OKLch, `color-mix`) |
| Comportamento | JavaScript ES modules (vanilla) |
| Tipografia | Google Fonts — Sora, Hanken Grotesk, IBM Plex Mono |
| Mídia | MP4 local + poster JPEG |

Dependências de produção: **nenhuma**. Vite é a única devDependency.

---

## Estrutura das seções

1. **Hero** — proposta de valor, CTA WhatsApp, badges de conformidade  
2. **Soluções** — Topografia, Regularização, Urbanismo, Acompanhamento de obras  
3. **Tecnologia** — Drones/GPS RTK, agilidade, conformidade  
4. **Como funciona** — diagnóstico → campo → projeto → entrega  
5. **Público** — proprietários × profissionais da construção  
6. **Prova + FAQ** — depoimentos (exemplo) e perguntas frequentes  
7. **CTA final** — solicitação de orçamento  
8. **Rodapé** — logo, links e pilares  

---

## Acessibilidade

- Contraste de texto ≥ WCAG AA nos dois temas  
- Alvos de toque ≥ 44×44 px  
- Skip link para `#main`  
- `aria-expanded` / `aria-label` no menu mobile e no toggle de tema  
- Suporte a `prefers-reduced-motion`  
- Sem scroll horizontal no mobile  

---

## Licença de mídia

| Recurso | Origem |
|---------|--------|
| `public/assets/hero-drone.mp4` | Gravação própria (frames em `media/frames/`) |
| `public/assets/hero-poster.jpg` | Frame extraído da gravação |
| Logos PROURBANA | Material da marca |
| Ícones | SVG inline (traço único) |

Não há imagens de banco de terceiros embutidas por URL remota; todos os arquivos ficam neste repositório.

---

## Contato

**PROURBANA — Projetos e Consultoria**  
Topografia · Regularização · Urbanismo  

Use os CTAs de WhatsApp na página ou abra uma issue neste repositório.
