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

/** nome de origem -> nome de saída */
const IMAGE_MAP = [
  ['14.25.17', 'portfolio-01.webp', 1400],
  ['14.25.49', 'portfolio-02.webp', 1400],
  ['14.25.50', 'portfolio-03.webp', 1400],
  ['14.25.55', 'portfolio-04.webp', 1400],
  ['14.25.57', 'portfolio-05.webp', 1400],
  ['14.25.58', 'portfolio-06.webp', 1400],
  ['14.26.00', 'portfolio-07.webp', 1400],
  ['14.25.43', 'rtk.webp', 1600],
]

async function main() {
  await fs.mkdir(outImages, { recursive: true })
  await fs.mkdir(outBrand, { recursive: true })

  const sources = await fs.readdir(srcDir)
  let count = 0

  for (const [needle, output, width] of IMAGE_MAP) {
    const file = sources.find((f) => f.includes(needle))
    if (!file) {
      console.warn(`[images] AVISO: nenhuma imagem encontrada para "${needle}"`)
      continue
    }
    await sharp(path.join(srcDir, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
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
