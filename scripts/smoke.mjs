/**
 * Smoke test de navegador: sobe o build de produção no Edge (já instalado na
 * máquina, sem baixar navegador) e verifica o essencial da entrega:
 *   1. preloader termina e some;
 *   2. a seção hero decodifica o vídeo escolhido pela largura (1280×720 no
 *      desktop / cena do drone 720×1280 no celular) e toca sozinha em loop
 *      (exibição, sem scrub de rolagem), com pôster nativo no fundo;
 *   3. no topo: logo grande visível + header escondido; ao rolar: logo sai e
 *      o header assume (e volta ao topo em seguida);
 *   4. botões no estilo novo: pill + mecânica do hover (ihb), ArrowFill nas
 *      seções (contato/rural), FAB de WhatsApp fixo, rodapé sem CTA;
 *   5. o rural vem pré-baixado do preloader (blob) e o src só seta perto da seção, e o loop avança sozinho;
 *   6. as 7 seções + rodapé existe e o rodapé entra na viewport;
 *   7. SplitText roda (há .split__char);
 *   8. zero erros de console/pageerror;
 *   9. sem estouro horizontal no desktop (1440) e no mobile (390).
 * Screenshots são gravados em smoke-shots/.
 */
import { spawn } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const shots = path.join(root, 'smoke-shots')
const PORT = 4173
const URL = `http://localhost:${PORT}/`

const failures = []
const notes = []
const check = (ok, label) => {
  if (ok) console.log(`  ok   ${label}`)
  else {
    failures.push(label)
    console.log(`  FAIL ${label}`)
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function startServer() {
  const proc = spawn(
    process.execPath,
    [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' },
  )
  const deadline = Date.now() + 30000
  for (;;) {
    if (Date.now() > deadline) throw new Error('preview não subiu em 30 s')
    try {
      const res = await fetch(URL)
      if (res.ok) break
    } catch {
      /* ainda subindo */
    }
    await wait(300)
  }
  return proc
}

const sampleVideo = (selector) => {
  const video = document.querySelector(selector)
  if (!video) return { err: 'sem elemento' }
  const w = video.videoWidth
  const h = video.videoHeight
  if (video.readyState < 2 || w < 100 || h < 100) {
    return { err: `readyState=${video.readyState} ${w}x${h}` }
  }
  // desenha o quadro atual num canvas offscreen para amostrar pixels
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.drawImage(video, 0, 0, w, h)
  const pts = [
    [w >> 1, h >> 1],
    [w >> 2, h >> 2],
    [(w * 3) >> 2, (h * 3) >> 2],
    [(w * 5) >> 3, (h * 2) >> 3],
  ]
  return {
    w,
    h,
    t: video.currentTime,
    src: video.currentSrc || video.src,
    colors: pts.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data).join(',')),
  }
}

async function scrollToEnd(page, { step = 700, max = 90 } = {}) {
  await page.mouse.move(700, 420)
  let last = -1
  let stuck = 0
  for (let i = 0; i < max; i++) {
    await page.mouse.wheel(0, step)
    await wait(140)
    const y = await page.evaluate(() => window.scrollY)
    if (y === last) {
      stuck += 1
      if (stuck >= 6) break
    } else stuck = 0
    last = y
  }
  return last
}

async function desktopPass(browser) {
  console.log('\n[desktop 1440x900]')
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const where = m.location()?.url ?? ''
    consoleErrors.push(where ? `${m.text()} → ${where}` : m.text())
  })
  page.on('pageerror', (e) => pageErrors.push(String(e)))

  await page.goto(URL, { waitUntil: 'load' })
  await page.screenshot({ path: path.join(shots, 'desktop-00-preloader.png') })

  await page.waitForSelector('.preloader', { state: 'detached', timeout: 60000 })
  check(true, 'preloader termina e some')
  await wait(2600)
  await page.screenshot({ path: path.join(shots, 'desktop-01-hero.png') })

  const sections = await page.evaluate(() =>
    ['sobre', 'servicos', 'rural', 'portfolio', 'prova', 'contato'].filter(
      (id) => document.getElementById(id),
    ),
  )
  check(sections.length === 6, `6 seções ancoradas (${sections.join(', ')})`)

  // espera o buffer do vídeo estar pronto para amostrar (evita readyState=1)
  await page
    .waitForFunction(
      () => {
        const v = document.querySelector('.hero .video-player__el')
        return !!v && v.readyState >= 2
      },
      { timeout: 15000 },
    )
    .catch(() => {})

  const painted = await page.evaluate(sampleVideo, '.hero .video-player__el')
  check(painted.err == null, `hero decodifica o vídeo (${painted.err ?? `${painted.w}×${painted.h}`})`)
  check(
    painted.w === 1280 && painted.h === 720,
    'vídeo do hero é nativo 1280×720 (sem upscale)',
  )
  check(
    Array.isArray(painted.colors) && new Set(painted.colors).size > 1,
    'hero mostra a imagem do vídeo (pixels variados)',
  )
  check(String(painted.src ?? '').startsWith('blob:'), 'hero usa o blob do preloader (baixou uma vez)')

  const deskRes = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((e) => e.name),
  )
  check(
    deskRes.some((n) => n.endsWith('/video/hero.mp4')) &&
      !deskRes.some((n) => n.endsWith('/video/hero-drone.mp4')),
    'desktop baixa o vídeo landscape atual, sem buscar o do drone',
  )

  const play1 = await page.evaluate(() => {
    const v = document.querySelector('.hero .video-player__el')
    return v ? { t: v.currentTime, paused: v.paused, loop: v.loop } : null
  })
  check(play1 !== null && !play1.paused, 'hero toca como vídeo (paused=false)')
  check(play1?.loop === true, 'hero repete em loop')
  await wait(1100)
  const play2 = await page.evaluate(
    () => document.querySelector('.hero .video-player__el')?.currentTime ?? -1,
  )
  check(
    play1 !== null && play2 > play1.t + 0.4,
    `hero avança sozinho, sem rolagem (${play1 ? play1.t.toFixed(2) : '-'}s → ${play2.toFixed(2)}s)`,
  )

  const layout = await page.evaluate(() => {
    const content = document.querySelector('.hero__content')
    const short = document.querySelector('.hero__short')
    const title = document.querySelector('.hero__title')
    const scrim = document.querySelector('.hero__scrim')
    const actions = document.querySelector('.hero__actions')
    let textRight = 0
    if (short) {
      const range = document.createRange()
      range.selectNodeContents(short)
      textRight = Math.round(range.getBoundingClientRect().right)
    }
    return {
      align: content ? getComputedStyle(content).textAlign : '',
      scrim: scrim ? getComputedStyle(scrim).backgroundImage : '',
      textRight,
      mid: Math.round(window.innerWidth / 2),
      shortSize: short ? parseFloat(getComputedStyle(short).fontSize) : 0,
      kicker: !!document.querySelector('.hero__kicker'),
      lead: !!document.querySelector('.hero__lead'),
      subShown: (() => {
        const s = document.querySelector('.hero__sub')
        if (!s) return false
        const r = s.getBoundingClientRect()
        return (
          getComputedStyle(s).display !== 'none' &&
          r.width > 4 &&
          s.textContent?.includes('Planejamento, precisão') === true
        )
      })(),
      subAboveActions: (() => {
        const s = document.querySelector('.hero__sub')?.getBoundingClientRect()
        const a = document.querySelector('.hero__actions')?.getBoundingClientRect()
        return !s || !a || s.bottom <= a.top + 1
      })(),
      titleSr: title ? title.getBoundingClientRect().width <= 2 : false,
      scrollY: Math.round(window.scrollY),
      actionsOpacity: actions ? parseFloat(getComputedStyle(actions).opacity) : 0,
      actionsY: actions ? getComputedStyle(actions).transform : '',
      actionsBottom: actions ? Math.round(actions.getBoundingClientRect().bottom) : 0,
      vh: window.innerHeight,
    }
  })
  check(layout.align === 'right', 'desktop: texto da hero alinhado à direita')
  check(layout.scrim.includes('260deg'), 'desktop: scrim leve pela direita (drone livre à esquerda)')
  check(
    layout.textRight > layout.mid,
    `texto da hero na metade direita (termina em ${layout.textRight}px de ${layout.mid * 2}px)`,
  )
  check(
    !layout.kicker && !layout.lead && layout.subShown && layout.subAboveActions && layout.titleSr,
    'hero padronizada: frase + subtítulo + botões (h1 sr-only)',
  )
  check(
    layout.shortSize >= 30 && layout.shortSize <= 60,
    `letra do texto curto grande e dentro do limite (${layout.shortSize}px)`,
  )
  check(
    layout.scrollY === 0 &&
      layout.actionsOpacity === 1 &&
      (layout.actionsY === 'none' || !layout.actionsY.includes('44')) &&
      layout.actionsBottom <= layout.vh,
    `botões da hero visíveis no load, no lugar (scrollY=${layout.scrollY} op=${layout.actionsOpacity} bottom=${layout.actionsBottom}/${layout.vh})`,
  )

  // topo: a logo grande manda e o header fica escondido
  const brandTop = await page.evaluate(() => {
    const b = document.querySelector('.hero__brand')
    const nav = document.querySelector('.nav')
    const img = b?.querySelector('img')
    if (!b || !img) return null
    const r = img.getBoundingClientRect()
    return {
      op: parseFloat(getComputedStyle(b).opacity),
      hiddenCls: !!nav && nav.className.includes('nav--hidden'),
      w: r.width,
      h: r.height,
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth,
      y: Math.round(window.scrollY),
    }
  })
  check(
    brandTop != null &&
      brandTop.y === 0 &&
      brandTop.op >= 0.9 &&
      brandTop.inView &&
      brandTop.w >= 60,
    `logo grande visível no topo (${brandTop ? `${Math.round(brandTop.w)}×${Math.round(brandTop.h)}px op=${brandTop.op}` : 'ausente'})`,
  )
  check(brandTop?.hiddenCls === true, 'header escondido no topo (nav--hidden)')

  // hover do botão principal troca o texto (mecânica do InteractiveHover)
  await page.hover('.hero__actions .ihb')
  await wait(450)
  const hov = await page.evaluate(() => {
    const g = document.querySelector('.hero__actions .ihb__ghost')
    return g ? parseFloat(getComputedStyle(g).opacity) : -1
  })
  check(hov > 0.5, `hover troca o texto do botão (ghost op=${hov.toFixed(2)})`)
  await page.mouse.move(20, 400)

  // rola um pouco: a logo sai e o header assume
  await page.mouse.move(700, 420)
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 260)
    await wait(90)
    const y = await page.evaluate(() => window.scrollY)
    if (y >= 320) break
  }
  await wait(700)
  const brandScrolled = await page.evaluate(() => {
    const b = document.querySelector('.hero__brand')
    const nav = document.querySelector('.nav')
    return {
      op: b ? parseFloat(getComputedStyle(b).opacity) : -1,
      navShown: !!nav && !nav.className.includes('nav--hidden'),
      y: Math.round(window.scrollY),
    }
  })
  check(brandScrolled.y >= 300, `rolagem de teste chegou a ${brandScrolled.y}px`)
  check(brandScrolled.op < 0.1, `logo grande sai ao rolar (op=${brandScrolled.op})`)

  // o design é "some ao descer, volta ao subir": subida leve faz o header aparecer
  await page.mouse.wheel(0, -160)
  await wait(700)
  const navUp = await page.evaluate(() => {
    const nav = document.querySelector('.nav')
    const b = document.querySelector('.hero__brand')
    return {
      navShown: !!nav && !nav.className.includes('nav--hidden'),
      brandHidden: b ? parseFloat(getComputedStyle(b).opacity) < 0.1 : false,
      y: Math.round(window.scrollY),
    }
  })
  check(
    navUp.navShown && navUp.brandHidden,
    `header assume a posição na subida leve (scrollY=${navUp.y})`,
  )
  check(navUp.y > 200, `header aparece sem voltar pro topo (scrollY=${navUp.y})`)
  await page.screenshot({ path: path.join(shots, 'desktop-02-rolagem.png') })

  // volta ao topo para os próximos checks
  for (let i = 0; i < 60; i++) {
    const y = await page.evaluate(() => window.scrollY)
    if (y <= 2) break
    await page.mouse.wheel(0, -700)
    await wait(80)
  }
  await wait(700)
  const backTop = await page.evaluate(() => Math.round(window.scrollY))
  check(backTop <= 2, `volta ao topo antes dos próximos checks (scrollY=${backTop})`)

  // botões: pill, mecânica ihb, ArrowFill nas seções, FAB e rodapé sem CTA
  const buttons = await page.evaluate(() => {
    const heroBtn = document.querySelector('.hero__actions .btn')
    const radius = heroBtn ? parseFloat(getComputedStyle(heroBtn).borderRadius) : 0
    const afbs = [...document.querySelectorAll('.afb')]
    const afbInfo = afbs.map((a) => ({
      r: parseFloat(getComputedStyle(a).borderRadius),
      h: a.getBoundingClientRect().height,
      arrows: a.querySelectorAll('.afb__circle .afb__arrow').length,
    }))
    const wa = document.querySelector('.wa-float')
    const waR = wa?.getBoundingClientRect()
    return {
      radius,
      dots: document.querySelectorAll('.ihb__dot').length,
      afbCount: afbs.length,
      afbsPill: afbs.length > 0 && afbInfo.every((a) => a.r >= 30),
      afbsBig: afbs.length > 0 && afbInfo.every((a) => a.h >= 40),
      afbsArrows: afbs.length > 0 && afbInfo.every((a) => a.arrows === 2),
      waOk:
        !!wa &&
        getComputedStyle(wa).position === 'fixed' &&
        (wa.getAttribute('href') ?? '').startsWith('https://wa.me/') &&
        !!waR &&
        waR.width > 40 &&
        waR.right <= window.innerWidth &&
        waR.bottom <= window.innerHeight,
      waOffTop: !!wa && wa.classList.contains('wa-float--off'),
      footerNoBtn: !document.querySelector('.footer .btn'),
    }
  })
  check(buttons.radius >= 30, `botões pill (border-radius=${buttons.radius}px)`)
  check(buttons.dots >= 2, `mecânica do hover em ${buttons.dots} botões (ihb__dot)`)
  check(buttons.afbCount >= 2, `ArrowFillButton nas seções (${buttons.afbCount})`)
  check(
    buttons.afbsPill && buttons.afbsBig && buttons.afbsArrows,
    'afb: pill ≥40px com círculo de 2 setas',
  )
  check(buttons.waOk, 'FAB de WhatsApp fixo com href wa.me')
  check(buttons.waOffTop, 'FAB oculto na hero (só aparece ao rolar)')
  check(buttons.footerNoBtn, 'CTA removido do rodapé')

  const poster = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve([img.naturalWidth, img.naturalHeight])
        img.onerror = () => resolve(null)
        img.src = '/video/hero-poster.webp'
      }),
  )
  check(poster?.[0] === 1280 && poster?.[1] === 720, `pôster do hero nativo (${poster?.join('×')})`)

  const logo = await page.evaluate(() => {
    const img = document.querySelector('.nav__brand img')
    return img ? [img.naturalWidth, img.naturalHeight] : null
  })
  check(
    logo?.[0] === 512 && logo?.[1] === 512,
    `nova logo quadrada 512×512 no header (${logo?.join('×')})`,
  )

  const ruralEarly = await page.evaluate(
    () => document.querySelector('.rural .video-player__el')?.getAttribute('src') ?? null,
  )
  check(!ruralEarly, 'vídeo do rural só carrega sob demanda (sem src no topo)')
  const ruralPre = await page.evaluate(() =>
    performance.getEntriesByType('resource').some((e) => e.name.includes('/video/rural.mp4')),
  )
  check(ruralPre, 'rural já baixado no preloader (zero rede na seção)')

  const chars = await page.evaluate(() => document.querySelectorAll('.split__char').length)
  check(chars > 0, `SplitText roda (${chars} caracteres)`)

  // caminha até cada seção e captura com as animações já assentadas
  for (const id of ['sobre', 'servicos', 'rural', 'portfolio', 'prova', 'contato']) {
    let found = false
    for (let i = 0; i < 160 && !found; i++) {
      found = await page.evaluate((target) => {
        const el = document.getElementById(target)
        if (!el) return false
        const r = el.getBoundingClientRect()
        return r.top <= 140 && r.bottom >= 420
      }, id)
      if (!found) {
        await page.mouse.wheel(0, 260)
        await wait(90)
      }
    }
    await wait(3600)
    check(found, `seção #${id} entra na viewport`)
    await page.screenshot({ path: path.join(shots, `section-${id}.png`) })

    if (id === 'rural') {
      const cardGone = await page.evaluate(
        () => document.querySelector('.rural__list') === null,
      )
      check(cardGone, 'card lateral removido — drone do rural livre')
      // o loop se move por saltos (seek ping-pong): quadros são apresentados
      // um a um entre os saltos — mede a taxa real via requestVideoFrameCallback
      const rural = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const video = document.querySelector('.rural .video-player__el')
            if (!video || typeof video.requestVideoFrameCallback !== 'function') {
              resolve(null)
              return
            }
            let frames = 0
            let colors = null
            const start = performance.now()
            const finish = () =>
              resolve({
                fps: Math.round((frames * 1000) / (performance.now() - start)),
                w: video.videoWidth,
                h: video.videoHeight,
                t: video.currentTime,
                colors,
              })
            const timer = setTimeout(finish, 3500)
            const onFrame = () => {
              frames += 1
              if (!colors && video.videoWidth >= 100) {
                const w = video.videoWidth
                const h = video.videoHeight
                const c = document.createElement('canvas')
                c.width = w
                c.height = h
                const ctx = c.getContext('2d')
                ctx.drawImage(video, 0, 0, w, h)
                const pts = [
                  [w >> 1, h >> 1],
                  [w >> 2, h >> 2],
                  [(w * 3) >> 2, (h * 3) >> 2],
                ]
                colors = pts.map(([x, y]) =>
                  Array.from(ctx.getImageData(x, y, 1, 1).data).join(','),
                )
              }
              if (performance.now() - start >= 2500) {
                clearTimeout(timer)
                finish()
              } else video.requestVideoFrameCallback(onFrame)
            }
            video.requestVideoFrameCallback(onFrame)
          }),
      )
      check(
        rural != null && rural.w === 1280 && rural.h === 720,
        `rural decodifica 1280×720 (${rural ? `${rural.w}×${rural.h}` : 'não medido'})`,
      )
      check(
        rural?.colors && new Set(rural.colors).size > 1,
        'rural mostra o quadro do vídeo (pixels variados)',
      )
      check(rural?.fps >= 15, `loop do rural apresenta ${rural?.fps} fps no monitor`)
      const t1 = rural?.t ?? 0
      await wait(900)
      const t2 = await page.evaluate(
        () => document.querySelector('.rural .video-player__el')?.currentTime ?? 0,
      )
      check(
        Math.abs(t2 - t1) > 0.3,
        `loop do rural anda nos dois sentidos (${t1.toFixed(2)}s → ${t2.toFixed(2)}s)`,
      )
    }

    if (id === 'sobre') {
      for (let i = 0; i < 40; i++) {
        const close = await page.evaluate(() => {
          const el = document.querySelector('.numbers')
          if (!el) return false
          const r = el.getBoundingClientRect()
          return r.top < 640 && r.bottom > 0
        })
        if (close) break
        await page.mouse.wheel(0, 220)
        await wait(90)
      }
      await wait(2600)
      const nums = await page.evaluate(() =>
        [...document.querySelectorAll('.numbers__value')].map((el) => ({
          t: el.textContent,
          o: getComputedStyle(el.closest('.numbers__item')).opacity,
        })),
      )
      check(
        nums.length === 4 && nums.every((n) => n.o === '1' && n.t && n.t !== '0'),
        `contadores terminam visíveis (${nums.map((n) => n.t).join(' · ')})`,
      )
    }
  }

  const endY = await scrollToEnd(page, { max: 60 })
  await page.screenshot({ path: path.join(shots, 'desktop-09-fim.png') })

  const footVisible = await page.evaluate(() => {
    const el = document.querySelector('.footer')
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.top < window.innerHeight && r.bottom > 0
  })
  check(footVisible, `rodapé entra na viewport (scrollY=${Math.round(endY)})`)

  const waFinal = await page.evaluate(() => {
    const wa = document.querySelector('.wa-float')
    return wa
      ? {
          op: parseFloat(getComputedStyle(wa).opacity),
          off: wa.classList.contains('wa-float--off'),
        }
      : null
  })
  check(
    waFinal != null && !waFinal.off && waFinal.op > 0.9,
    `FAB aparece depois da hero (op=${waFinal?.op})`,
  )

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  check(overflow <= 1, `sem estouro horizontal (Δ=${overflow}px)`)

  const cols = await page.evaluate(() => {
    const t = document.querySelector('.portfolio__track')
    if (!t) return 0
    return Math.round(t.scrollWidth)
  })
  check(cols > 0, `track do portfólio mede ${cols}px (pin horizontal)`)

  const vidDiag = await page.evaluate(() => window.__vidDiag ?? [])
  check(
    Array.isArray(vidDiag) && vidDiag.some((l) => l.includes('play: tocando')),
    `diagnóstico [vid] ativo (${vidDiag.length} linhas)`,
  )

  check(pageErrors.length === 0, `zero pageerror${pageErrors.length ? ` → ${pageErrors[0]}` : ''}`)
  const realErrors = consoleErrors.filter((e) => !/font|favicon|net::ERR_NAME/i.test(e))
  check(realErrors.length === 0, `zero console.error${realErrors.length ? ` → ${realErrors[0]}` : ''}`)
  if (consoleErrors.length > realErrors.length) {
    notes.push(`${consoleErrors.length - realErrors.length} aviso(s) de fonte/favicon ignorado(s)`)
  }

  await page.close()
}

async function mobilePass(browser) {
  console.log('\n[mobile 390x844]')
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  })
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(String(e)))

  await page.goto(URL, { waitUntil: 'load' })
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 60000 })
  await wait(500)

  // topo: logo grande no lugar e header escondido
  const mTop = await page.evaluate(() => {
    const b = document.querySelector('.hero__brand')
    const nav = document.querySelector('.nav')
    const mono = b?.querySelector('img')
    if (!b || !mono) return null
    const r = mono.getBoundingClientRect()
    return {
      op: parseFloat(getComputedStyle(b).opacity),
      hiddenCls: !!nav && nav.className.includes('nav--hidden'),
      h: r.height,
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth,
      y: Math.round(window.scrollY),
    }
  })
  check(
    mTop != null && mTop.y === 0 && mTop.op >= 0.9 && mTop.inView && mTop.h >= 60,
    `logo grande visível no topo do mobile (${mTop ? `${Math.round(mTop.h)}px` : 'ausente'})`,
  )
  check(mTop?.hiddenCls === true, 'header escondido no topo do mobile')

  // rola (a logo sai) e faz a subida leve em que o header assume
  for (let i = 0; i < 30; i++) {
    const y = await page.evaluate(() => window.scrollY)
    if (y >= 320) break
    await page.mouse.wheel(0, 260)
    await wait(90)
  }
  await wait(500)
  await page.mouse.wheel(0, -160)
  await wait(700)

  const mNavShown = await page.evaluate(() => {
    const nav = document.querySelector('.nav')
    return !!nav && !nav.className.includes('nav--hidden')
  })
  check(mNavShown, 'header aparece no mobile na subida leve')

  const toggleVisible = await page.locator('.nav__toggle').isVisible()
  check(toggleVisible, 'menu hambúrguer visível quando o header aparece')

  const linksHidden = !(await page.locator('.nav__links').isVisible())
  check(linksHidden, 'links do desktop ocultos no mobile')

  const ctaHidden = !(await page.locator('.nav__cta').isVisible())
  check(ctaHidden, 'CTA do header oculto no mobile (só no menu)')

  const overlap = await page.evaluate(() => {
    const a = document.querySelector('.nav__brand')?.getBoundingClientRect()
    const b = document.querySelector('.nav__actions')?.getBoundingClientRect()
    if (!a || !b) return false
    return a.right > b.left + 1
  })
  check(!overlap, 'marca e ações do header sem sobreposição no mobile')

  // volta ao topo para os checks da hero
  for (let i = 0; i < 60; i++) {
    const y = await page.evaluate(() => window.scrollY)
    if (y <= 2) break
    await page.mouse.wheel(0, -700)
    await wait(80)
  }
  await wait(700)
  const mBackTop = await page.evaluate(() => Math.round(window.scrollY))
  check(mBackTop <= 2, `mobile volta ao topo (scrollY=${mBackTop})`)

  await wait(1600)

  const heroMobile = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: r.width, h: r.height, bottom: r.bottom, display: getComputedStyle(el).display }
    }
    const shown = (sel) => {
      const b = box(sel)
      return !!b && b.display !== 'none' && b.w > 4 && b.h > 4
    }
    const v = document.querySelector('.hero .video-player__el')
    const content = box('.hero__content')
    const title = document.querySelector('.hero__title')
    const subEl = document.querySelector('.hero__sub')
    const subR = subEl?.getBoundingClientRect()
    const actR = document.querySelector('.hero__actions')?.getBoundingClientRect()
    const logo = document.querySelector('.nav__brand img')
    return {
      short: shown('.hero__short'),
      sub: shown('.hero__sub'),
      subOk:
        !!subR &&
        subR.width > 4 &&
        subEl.textContent?.includes('Planejamento, precisão') === true &&
        (!actR || subR.bottom <= actR.top + 1),
      logoOk: !!logo && logo.naturalWidth === 512 && logo.naturalHeight === 512,
      actions: shown('.hero__actions'),
      noKicker: !document.querySelector('.hero__kicker'),
      noLead: !document.querySelector('.hero__lead'),
      titleSr: title ? title.getBoundingClientRect().width <= 2 : false,
      vW: v?.videoWidth ?? 0,
      vH: v?.videoHeight ?? 0,
      bottom: content
        ? content.bottom > window.innerHeight * 0.6 && content.bottom <= window.innerHeight + 1
        : false,
      playing: !!v && !v.paused && v.currentTime > 0,
    }
  })
  check(
    heroMobile.short &&
      heroMobile.sub &&
      heroMobile.subOk &&
      heroMobile.actions &&
      heroMobile.noKicker &&
      heroMobile.noLead &&
      heroMobile.titleSr,
    'hero mobile: texto curto + subtítulo (sem sobreposição) + 2 botões (h1 sr-only)',
  )
  check(heroMobile.logoOk, 'nova logo 512×512 visível no header mobile')
  check(heroMobile.bottom, 'hero mobile: conteúdo na parte inferior')
  check(heroMobile.playing, 'hero mobile toca como vídeo')
  check(
    heroMobile.vW === 720 && heroMobile.vH === 1280,
    `vídeo do celular é a cena do drone, nativa 720×1280 (${heroMobile.vW}×${heroMobile.vH})`,
  )
  const mobRes = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((e) => e.name),
  )
  check(
    mobRes.some((n) => n.endsWith('/video/hero-drone.mp4')) &&
      !mobRes.some((n) => n.endsWith('/video/hero.mp4')),
    'celular só baixa o vídeo do drone (sem buscar o landscape)',
  )
  const ruralPreMob = await page.evaluate(() =>
    performance.getEntriesByType('resource').some((e) => e.name.includes('/video/rural.mp4')),
  )
  check(ruralPreMob, 'rural já baixado no preloader no mobile (zero rede na seção)')

  const mExtras = await page.evaluate(() => {
    const short = document.querySelector('.hero__short')
    const shortSize = short ? parseFloat(getComputedStyle(short).fontSize) : 0
    const wa = document.querySelector('.wa-float')
    const waR = wa?.getBoundingClientRect()
    const afbs = document.querySelectorAll('.afb').length
    return {
      shortSize,
      waOk:
        !!wa &&
        getComputedStyle(wa).position === 'fixed' &&
        (wa.getAttribute('href') ?? '').startsWith('https://wa.me/') &&
        !!waR &&
        waR.width > 40 &&
        waR.right <= window.innerWidth &&
        waR.bottom <= window.innerHeight,
      waOff: !!wa && wa.classList.contains('wa-float--off'),
      afbs,
      footerNoBtn: !document.querySelector('.footer .btn'),
    }
  })
  check(
    mExtras.shortSize <= 40,
    `texto curto do mobile legível sem virar cartaz (${mExtras.shortSize}px ≤ 40)`,
  )
  check(mExtras.waOk && mExtras.waOff, 'FAB de WhatsApp fixo e oculto na hero mobile')
  check(mExtras.afbs >= 2, `ArrowFillButton presente no mobile (${mExtras.afbs})`)
  check(mExtras.footerNoBtn, 'rodapé mobile sem botão de CTA')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  check(overflow <= 1, `sem estouro horizontal (Δ=${overflow}px)`)

  await page.screenshot({ path: path.join(shots, 'mobile-01-hero.png') })

  let mPinned = false
  for (let i = 0; i < 60 && !mPinned; i++) {
    await page.mouse.wheel(0, 400)
    await wait(120)
    mPinned = await page.evaluate(() => {
      const pin = document.querySelector('.portfolio__pin')
      if (!pin) return false
      return pin.getBoundingClientRect().top <= 1
    })
  }
  await page.mouse.wheel(0, 800)
  await wait(500)
  const mTrackX = await page.evaluate(() => {
    const t = document.querySelector('.portfolio__track')
    if (!t) return 0
    const tf = getComputedStyle(t).transform
    const m = tf && tf !== 'none' ? tf.match(/matrix\(([^)]+)\)/) : null
    return m ? parseFloat(m[1].split(',')[4]) : 0
  })
  check(
    mPinned && mTrackX < -10,
    `portfólio mobile segue a rolagem normal (pin=${mPinned}, trilha=${Math.round(mTrackX)}px)`,
  )

  await scrollToEnd(page, { step: 500, max: 70 })
  await page.screenshot({ path: path.join(shots, 'mobile-02-fim.png') })

  const mWaFinal = await page.evaluate(() => {
    const wa = document.querySelector('.wa-float')
    return wa
      ? {
          op: parseFloat(getComputedStyle(wa).opacity),
          off: wa.classList.contains('wa-float--off'),
        }
      : null
  })
  check(
    mWaFinal != null && !mWaFinal.off && mWaFinal.op > 0.9,
    `FAB aparece depois da hero mobile (op=${mWaFinal?.op})`,
  )

  const mVidDiag = await page.evaluate(() => window.__vidDiag ?? [])
  check(
    Array.isArray(mVidDiag) && mVidDiag.some((l) => l.includes('play: tocando')),
    `diagnóstico [vid] ativo no mobile (${mVidDiag.length} linhas)`,
  )

  check(pageErrors.length === 0, `zero pageerror${pageErrors.length ? ` → ${pageErrors[0]}` : ''}`)
  await page.close()
}

async function main() {
  await rm(shots, { recursive: true, force: true })
  await mkdir(shots, { recursive: true })

  const server = await startServer()
  let browser
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true })
    await desktopPass(browser)
    await mobilePass(browser)
  } finally {
    if (browser) await browser.close().catch(() => {})
    server.kill()
  }

  console.log(`\nscreenshots: ${path.relative(process.cwd(), shots)}/`)
  for (const n of notes) console.log(`nota: ${n}`)
  if (failures.length) {
    console.log(`\n${failures.length} falha(s):`)
    for (const f of failures) console.log(` - ${f}`)
    process.exitCode = 1
  } else {
    console.log('\nsmoke ok — todas as verificações passaram')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
