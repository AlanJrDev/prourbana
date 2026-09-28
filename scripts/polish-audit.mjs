import { chromium } from 'playwright-core'

const URL = 'http://localhost:4173/'
const out = { desktop: {}, mobile: {} }
const errors = []

async function collect(page) {
  return page.evaluate(() => {
    const parse = (str) => {
      const m = String(str).match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const [r, g, b, a = '1'] = m[1].split(',').map((x) => parseFloat(x))
      return { r, g, b, a }
    }
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        v /= 255
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (f, b) => {
      const l1 = lum(f)
      const l2 = lum(b)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    }
    const effBg = (el) => {
      let node = el
      while (node && node !== document.documentElement) {
        const c = parse(getComputedStyle(node).backgroundColor)
        if (c && c.a > 0.9) return c
        node = node.parentElement
      }
      return parse('rgb(255,255,255)')
    }
    const selPath = (el) => {
      const bits = []
      while (el && bits.length < 3) {
        let s = el.tagName.toLowerCase()
        if (el.className && typeof el.className === 'string')
          s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        bits.unshift(s)
        el = el.parentElement
      }
      return bits.join(' > ')
    }
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      const st = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && st.opacity !== '0'
    }

    const res = {}
    res.overflowX = document.documentElement.scrollWidth - window.innerWidth

    // small text
    res.smallText = []
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue
      if (el.children.length > 0) continue
      const txt = (el.textContent || '').trim()
      if (!txt) continue
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs < 11.5) res.smallText.push({ sel: selPath(el), fs, txt: txt.slice(0, 40) })
    }

    // contrast on text leaves
    res.contrast = []
    const seen = new Set()
    for (const el of document.querySelectorAll('p, li, span, a, h1, h2, h3, h4, figcaption, button, small, dt, dd, figcaption')) {
      if (!visible(el)) continue
      if (el.children.length > 0) continue
      const txt = (el.textContent || '').trim()
      if (!txt) continue
      const st = getComputedStyle(el)
      const fg = parse(st.color)
      if (!fg || fg.a < 0.9) continue
      const bg = effBg(el)
      const r = ratio(fg, bg)
      const fs = parseFloat(st.fontSize)
      const weight = parseInt(st.fontWeight) || 400
      const large = fs >= 24 || (fs >= 18.66 && weight >= 700)
      const need = large ? 3 : 4.5
      if (r < need) {
        const key = st.color + '|' + bg.r + selPath(el)
        if (seen.has(key)) continue
        seen.add(key)
        res.contrast.push({ sel: selPath(el), color: st.color, fs, ratio: +r.toFixed(2), need, txt: txt.slice(0, 40) })
      }
    }

    // tap targets (interactive)
    res.tap = []
    for (const el of document.querySelectorAll('a, button')) {
      if (!visible(el)) continue
      const r = el.getBoundingClientRect()
      if (r.height < 40 || r.width < 32) {
        res.tap.push({ sel: selPath(el), w: Math.round(r.width), h: Math.round(r.height), txt: (el.textContent || '').trim().slice(0, 30) })
      }
    }

    // section rhythm
    res.sections = []
    for (const s of document.querySelectorAll('section')) {
      const st = getComputedStyle(s)
      res.sections.push({
        id: s.id || selPath(s),
        pt: Math.round(parseFloat(st.paddingTop)),
        pb: Math.round(parseFloat(st.paddingBottom)),
      })
    }

    // heading balance
    res.headings = []
    for (const h of document.querySelectorAll('h1, h2, .section-title')) {
      if (!visible(h)) continue
      const st = getComputedStyle(h)
      res.headings.push({
        sel: selPath(h),
        wrap: st.textWrap || st.textWrapStyle || '?',
        fs: Math.round(parseFloat(st.fontSize)),
        txt: (h.textContent || '').trim().slice(0, 40),
      })
    }

    // counter tabular
    const num = document.querySelector('.numbers__value')
    res.numbers = num ? getComputedStyle(num).fontVariantNumeric : null

    // images
    res.images = []
    for (const img of document.querySelectorAll('img')) {
      res.images.push({
        sel: selPath(img),
        loading: img.getAttribute('loading'),
        decoding: img.getAttribute('decoding'),
        hasDims: !!(img.getAttribute('width') && img.getAttribute('height')),
      })
    }

    // header height + anchor offset: scroll #servicos into view
    res.headerH = document.querySelector('header, .nav')?.getBoundingClientRect().height ?? 0
    res.scrollPadding = getComputedStyle(document.documentElement).scrollPaddingTop

    // selection / tap-highlight / scrollbar probes
    const sel = getComputedStyle(document.body, '::selection')
    res.selection = { bg: sel.backgroundColor, color: sel.color }
    res.tapHighlight = getComputedStyle(document.body).webkitTapHighlightColor || '?'
    res.scrollbar = getComputedStyle(document.documentElement).scrollbarWidth || '?'

    // focus ring probe
    const firstLink = document.querySelector('a')
    if (firstLink) {
      firstLink.focus()
      const fs = getComputedStyle(firstLink)
      res.focusRing = { outline: fs.outlineStyle + ' ' + fs.outlineWidth + ' ' + fs.outlineColor }
      firstLink.blur()
    }

    return res
  })
}

async function anchorOffset(page, label) {
  let viaClick = false
  if (label === 'desktop') {
    const link = page.locator('a[href="#servicos"]').first()
    if ((await link.count()) && (await link.isVisible())) {
      await link.click()
      await page.waitForTimeout(1600)
      viaClick = true
    }
  }
  if (!viaClick) {
    await page.evaluate(() => {
      document.querySelector('#servicos')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await page.waitForTimeout(300)
  }
  return page.evaluate(() => {
    const sec = document.querySelector('#servicos')
    const header = document.querySelector('header, .nav')
    if (!sec) return { sectionTop: null, headerH: 0 }
    return {
      sectionTop: Math.round(sec.getBoundingClientRect().top),
      headerH: Math.round(header?.getBoundingClientRect().height ?? 0),
    }
  })
}

async function navMenu(page) {
  const res = {}
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(700)
  const toggle = page.locator('.nav__toggle, [aria-label*="menu" i]').first()
  if (!(await toggle.count())) return { missing: true }
  await toggle.click()
  await page.waitForTimeout(600)
  res.open = await page.evaluate(() => {
    const bodyOverflow = getComputedStyle(document.body).overflow
    const menu = document.querySelector('.nav-sheet')
    const links = [...document.querySelectorAll('.nav-sheet a')].filter(
      (a) => a.getBoundingClientRect().height > 0,
    )
    return {
      bodyOverflow,
      links: links.map((a) => {
        const r = a.getBoundingClientRect()
        return { txt: (a.textContent || '').trim().slice(0, 20), h: Math.round(r.height) }
      }),
      menuRect: menu ? { h: Math.round(menu.getBoundingClientRect().height) } : null,
    }
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(900)
  res.closedByEscape = await page.evaluate(() => {
    const menu = document.querySelector('.nav-sheet')
    return !menu || getComputedStyle(menu).visibility === 'hidden'
  })
  return res
}

try {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })

  for (const [label, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport })
    page.on('pageerror', (e) => errors.push(`${label} pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`${label} console: ${m.text()}`)
    })
    await page.goto(URL, { waitUntil: 'load', timeout: 30000 })
    await page.waitForSelector('section', { timeout: 20000 })
    await page.waitForTimeout(1200)
    // scroll whole page to trigger reveals/lazy
    await page.evaluate(async () => {
      const h = document.body.scrollHeight
      for (let y = 0; y <= h; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 40))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(800)

    out[label] = await collect(page)
    out[label].anchor = await anchorOffset(page, label)
    if (label === 'mobile') out[label].nav = await navMenu(page)
    await page.close()
  }

  await browser.close()
} catch (e) {
  errors.push('FATAL: ' + e.message)
}

out.errors = errors
console.log(JSON.stringify(out, null, 1))
