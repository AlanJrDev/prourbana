/**
 * Converte as imagens de origem em WebP otimizado em public/images,
 * prepara a marca em public/brand, gera o og-image e os pôsteres dos vídeos.
 *
 * Uso: node scripts/optimize-images.mjs
 */
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(process.cwd())
const srcDir = path.join(root, 'images')
const brandDir = path.join(root, 'logo e letreiro')
const outImages = path.join(root, 'public', 'images')
const outBrand = path.join(root, 'public', 'brand')

const PETROLEUM = { r: 11, g: 43, b: 54 }

/** nome de origem -> nome de saída [, largura, qualidade, trim, branqueiaPalavras] */
const IMAGE_MAP = [
  ['14.25.17', 'portfolio-01.webp', 1400],
  ['14.25.58', 'portfolio-06.webp', 1400],
  ['novas5', 'portfolio-08.webp', 1400],
  ['novas6', 'portfolio-09.webp', 1400],
  ['novas1', 'portfolio-10.webp', 1400],
  ['novas4', 'portfolio-11.webp', 1400],
  ['viaduto-itapoa', 'portfolio-12.webp', 1400],
  ['novas0', 'portfolio-13.webp', 1400],
  ['novas2', 'service-prancha.webp', 1400],
  ['topo-campo', 'service-levantamento.webp', 1400],
  ['14.25.57', 'service-asbuilt.webp', 1400],
  ['14.25.17', 'service-regularizacao.webp', 1400],
  ['brand-strip', 'brand-strip.webp', 1600, 92, true, true],
  ['14.25.43', 'rtk.webp', 1600],
]

/**
 * Passa as palavras douradas para quase-branco (mantém a régua superior dourada).
 * Detecta a régua como a linha com mais píxeis dourados e só clareia abaixo dela.
 */
async function whitenWords(pipeline) {
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const gold = (i) => {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    return r > 110 && r > b + 35 && g > b && g <= r + 10 && r - b > 45
  }
  const perRow = new Array(height).fill(0)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) if (gold((y * width + x) * channels)) perRow[y]++
  }
  let ruleRow = 0
  let best = 0
  for (let y = 0; y < height; y++) {
    if (perRow[y] > best) {
      best = perRow[y]
      ruleRow = y
    }
  }
  for (let y = ruleRow + 1; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      if (!gold(i)) continue
      const k = 0.9
      data[i] = Math.round(data[i] + (255 - data[i]) * k)
      data[i + 1] = Math.round(data[i + 1] + (255 - data[i + 1]) * k)
      data[i + 2] = Math.round(data[i + 2] + (255 - data[i + 2]) * k)
    }
  }
  return sharp(data, { raw: { width, height, channels } })
}

async function main() {
  await fs.mkdir(outImages, { recursive: true })
  await fs.mkdir(outBrand, { recursive: true })

  const sources = await fs.readdir(srcDir)
  let count = 0

  for (const [needle, output, width, quality = 80, trim = false, whiten = false] of IMAGE_MAP) {
    const file = sources.find((f) => f.includes(needle))
    if (!file) {
      console.warn(`[images] AVISO: nenhuma imagem encontrada para "${needle}"`)
      continue
    }
    let pipeline = sharp(path.join(srcDir, file))
    // corta as bordas totalmente transparentes antes de dimensionar
    if (trim) pipeline = pipeline.trim({ threshold: 18 })
    pipeline = pipeline.resize({ width, withoutEnlargement: true })
    if (whiten) pipeline = await whitenWords(pipeline)
    await pipeline
      .webp({ quality, effort: 5, alphaQuality: 90 })
      .toFile(path.join(outImages, output))
    count++
    console.log(`[images] ${file} -> public/images/${output}`)
  }

  // ---- marca -------------------------------------------------------------
  const logo = path.join(brandDir, 'logo.png')
  const letreiro = path.join(brandDir, 'letreiro.png')

  await sharp(logo)
    .trim()
    .resize({ width: 512, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outBrand, 'logo.png'))

  await sharp(letreiro)
    .trim()
    .resize({ width: 900, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outBrand, 'letreiro.png'))
  console.log('[brand] logo.png e letreiro.png prontos')

  // ---- og-image 1200x630 -------------------------------------------------
  const wordmarkWhite = await sharp(letreiro)
    .trim()
    .resize({ width: 760, withoutEnlargement: true })
    .greyscale()
    .negate({ alpha: false })
    .png()
    .toBuffer()

  const monogram = await sharp(logo).trim().resize({ width: 150 }).png().toBuffer()

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: PETROLEUM },
  })
    .composite([
      { input: monogram, left: 525, top: 120 },
      { input: wordmarkWhite, left: 220, top: 330 },
      {
        input: Buffer.from(
          `<svg width="1200" height="630"><text x="600" y="530" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="#C8873F">TOPOGRAFIA · ARQUITETURA · REGULARIZAÇÃO</text></svg>`,
        ),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(path.join(root, 'public', 'og-image.png'))

  // ---- pôsteres dos vídeos (quadro nativo 1280x720, sem resize) -----------
  const outVideo = path.join(root, 'public', 'video')
  await fs.mkdir(outVideo, { recursive: true })
  const videoPosters = [
    [path.join(root, 'framesinicial', 'ezgif-frame-054.jpg'), 'hero-poster.webp'],
    [path.join(root, 'framesrural', 'ezgif-frame-120.jpg'), 'rural-poster.webp'],
  ]
  for (const [src, output] of videoPosters) {
    await sharp(src).webp({ quality: 88, effort: 5 }).toFile(path.join(outVideo, output))
    console.log(`[video] ${path.basename(src)} -> public/video/${output}`)
  }

  console.log(`[done] ${count} imagens + marca + og-image + pôsteres`)
}

main().catch((err) => {
  console.error('[images] falhou:', err)
  process.exit(1)
})
