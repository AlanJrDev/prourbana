#!/usr/bin/env node
/**
 * Recolora o monograma (public/brand/logo.png) para casar com o letreiro:
 *   - corpo cinza clarinho -> branco exato do letreiro
 *   - linhas de topografia tan -> laranja exato do letreiro
 *
 * Só o RGB é remapeado: forma, textura, brilho e alfa ficam intactos.
 * As cores alvo são amostradas de public/brand/letreiro.png (fonte da verdade).
 *
 * Uso: node scripts/recolor-logo.mjs [entrada] [saida]
 *   padrão: reescreve public/brand/logo.png in-place.
 * Aborta se a entrada tiver corpo escuro (ex.: fonte navy) — não é a arte esperada.
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2] ?? path.join(root, 'public', 'brand', 'logo.png')
const output = process.argv[3] ?? input
const letreiroPath = path.join(root, 'public', 'brand', 'letreiro.png')

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

/** Amostra a cor dominante do letreiro. mode(pick) devolve [r,g,b] ou null. */
async function sampleLetreiro() {
  const { data } = await sharp(letreiroPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const whites = new Map()
  const oranges = new Map()
  const bump = (m, r, g, b) => {
    const k = `${r},${g},${b}`
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 250) continue
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (r >= 230 && g >= 230 && b >= 230) bump(whites, r, g, b)
    else if (r > 150 && r > b + 80) bump(oranges, Math.round(r / 4) * 4, Math.round(g / 4) * 4, Math.round(b / 4) * 4)
  }
  const top = (m) => {
    const e = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
    return e ? e[0].split(',').map(Number) : null
  }
  return { white: top(whites) ?? [255, 255, 255], orange: top(oranges) ?? [245, 121, 1] }
}

async function main() {
  const { white, orange } = await sampleLetreiro()
  console.log(`[recolor] alvo letreiro — branco ${white} / laranja ${orange}`)

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: ch } = info
  if (ch !== 4) throw new Error(`esperava RGBA, veio ${ch} canais`)

  // passo 1: médias do corpo (neutro claro) e das linhas (quente)
  let bodySum = [0, 0, 0], bodyN = 0
  let lineSum = 0, lineN = 0
  const weight = (r, g, b) => Math.min(1, Math.max(0, (r - b - 20) / 50))
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const wn = weight(r, g, b)
    if (wn < 0.2) {
      bodySum[0] += r; bodySum[1] += g; bodySum[2] += b; bodyN++
    } else if (wn > 0.8) {
      lineSum += lum(r, g, b); lineN++
    }
  }
  if (!bodyN || !lineN) throw new Error('não achei corpo/linhas na arte')
  const bodyMean = bodySum.map((v) => v / bodyN)
  const lineLum = lineSum / lineN
  const bodyLum = lum(...bodyMean)
  if (bodyLum < 180) {
    throw new Error(`corpo escuro (lum=${Math.round(bodyLum)}) — essa entrada não é a arte clara do site (fonte navy?). Abortando.`)
  }
  console.log(`[recolor] corpo médio ${bodyMean.map((v) => Math.round(v))} | linhas lum ${Math.round(lineLum)}`)
  if (Math.abs(bodyMean[0] - white[0]) <= 4 && Math.abs(bodyMean[1] - white[1]) <= 4 && Math.abs(bodyMean[2] - white[2]) <= 4) {
    console.log('[recolor] corpo já está no branco alvo — nada a fazer')
    return
  }

  const fb = white.map((c, k) => c / Math.max(bodyMean[k], 1)) // corpo -> branco do letreiro
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const wn = weight(r, g, b)
    // corpo: fator multiplicativo preserva a textura/marmore sem estourar no branco
    const br = Math.min(255, r * fb[0])
    const bg = Math.min(255, g * fb[1])
    const bb = Math.min(255, b * fb[2])
    // linha: mesma luminância relativa, matiz laranja do letreiro
    const f = Math.min(1.6, lum(r, g, b) / lineLum)
    const lr = Math.min(255, orange[0] * f)
    const lg = Math.min(255, orange[1] * f)
    const lb = Math.min(255, orange[2] * f)
    out[i] = Math.round(br + (lr - br) * wn)
    out[i + 1] = Math.round(bg + (lg - bg) * wn)
    out[i + 2] = Math.round(bb + (lb - bb) * wn)
    // alfa intocado
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(output)
  console.log(`[recolor] ${path.relative(root, input)} -> ${path.relative(root, output)} (${w}x${h})`)
}

main().catch((e) => {
  console.error('[recolor] ERRO:', e.message)
  process.exit(1)
})
