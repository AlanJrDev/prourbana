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

/** nome de origem -> nome de saída [, largura, qualidade, trim] */
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
  // faixa nova já vem branca com pontos laranja — só trim
  ['brand-strip', 'brand-strip.webp', 1600, 92, true],
  ['14.25.43', 'rtk.webp', 1600],
]

async function main() {
  await fs.mkdir(outImages, { recursive: true })
  await fs.mkdir(outBrand, { recursive: true })

  const sources = await fs.readdir(srcDir)
  let count = 0

  for (const [needle, output, width, quality = 80, trim = false] of IMAGE_MAP) {
    const file = sources.find((f) => f.includes(needle))
    if (!file) {
      console.warn(`[images] AVISO: nenhuma imagem encontrada para "${needle}"`)
      continue
    }
    let pipeline = sharp(path.join(srcDir, file))
    // corta as bordas totalmente transparentes antes de dimensionar
    if (trim) pipeline = pipeline.trim({ threshold: 18 })
    pipeline = pipeline.resize({ width, withoutEnlargement: true })
    await pipeline
      .webp({ quality, effort: 5, alphaQuality: 90 })
      .toFile(path.join(outImages, output))
    count++
    console.log(`[images] ${file} -> public/images/${output}`)
  }

  // ---- marca -------------------------------------------------------------
  const letreiro = path.join(brandDir, 'letreiro.png')

  // logo.png NÃO é regenerado aqui: é a arte clara recolorida pelo cliente
  // (scripts/recolor-logo.mjs). A fonte navy em 'logo e letreiro/' tem
  // geometria diferente e não pode sobrescrevê-la.
  await sharp(letreiro)
    .trim()
    .resize({ width: 900, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outBrand, 'letreiro.png'))
  console.log('[brand] letreiro.png pronta')

  // ---- og-image 1200x630 -------------------------------------------------
  // letreiro novo já é branco (com detalhe laranja) — sem greyscale/negate
  const wordmarkWhite = await sharp(letreiro)
    .trim()
    .resize({ width: 760, withoutEnlargement: true })
    .png()
    .toBuffer()

  // monograma = arte recolorida do site (branco/laranja do letreiro)
  const monogram = await sharp(path.join(outBrand, 'logo.png'))
    .trim()
    .resize({ width: 150 })
    .png()
    .toBuffer()

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
    [path.join(root, 'framesinicial', 'hero-frame0.jpg'), 'hero-poster.webp'],
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
