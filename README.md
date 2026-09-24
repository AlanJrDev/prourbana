# PROURBANA — Projetos e Consultoria

Landing page institucional da **PROURBANA**: topografia, regularização fundiária e urbanismo. Site estático em HTML, CSS e JavaScript — sem build, sem framework e sem backend.

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
├── index.html                 # Página completa (HTML + CSS + JS)
├── assets/
│   ├── hero-drone.mp4         # Vídeo de fundo do hero (loop)
│   ├── hero-poster.jpg        # Frame estático / fallback do vídeo
│   ├── prourban-mark.png      # Monograma (nav)
│   ├── prourban-logo-full.png # Logo completo (rodapé)
│   └── prourban-logo.jpeg     # Logo oficial de referência
├── frames/                    # Frames originais do drone (fonte do vídeo)
├── .gitignore
└── README.md
```

---

## Como executar localmente

Não há etapa de build. Basta servir a pasta raiz por HTTP (o vídeo e as fontes se comportam melhor via servidor do que com `file://`).

**Python 3**

```bash
cd prourban
python -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080).

**Node.js (npx)**

```bash
npx serve .
```

**VS Code**

Use a extensão *Live Server* → *Go Live* na raiz do projeto.

---

## Como publicar (GitHub Pages)

1. Push deste repositório no GitHub.
2. Em **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `/ (root)`
3. Aguarde o deploy e acesse `https://alanjrdev.github.io/prourbana/`.

Alternativa com Actions: use qualquer workflow estático que publique a raiz do repositório.

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
- Tokens de cor em OKLch no bloco `:root` e `:root[data-theme="light"]` de `index.html`.

### Vídeo do hero

- Arquivo: `assets/hero-drone.mp4` (mudo, `playsinline`).
- Comportamento **boomerang**: toca até o fim, reverte até o início e recomeça.
- Fallback: `assets/hero-poster.jpg` enquanto o vídeo não inicia.
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
| Markup | HTML5 semântico |
| Estilo | CSS moderno (custom properties, OKLch, `color-mix`) |
| Comportamento | JavaScript vanilla (ES5+ compatível) |
| Tipografia | Google Fonts — Sora, Hanken Grotesk, IBM Plex Mono |
| Mídia | MP4 local + poster JPEG |

Sem dependências de runtime, sem npm install e sem etapa de build.

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
| `assets/hero-drone.mp4` | Gravação própria (frames em `frames/`) |
| `assets/hero-poster.jpg` | Frame extraído da gravação |
| Logos PROURBANA | Material da marca |
| Ícones | SVG inline (traço único) |

Não há imagens de banco de terceiros embutidas por URL remota; todos os arquivos ficam neste repositório.

---

## Contato

**PROURBANA — Projetos e Consultoria**  
Topografia · Regularização · Urbanismo  

Use os CTAs de WhatsApp na página ou abra uma issue neste repositório.
