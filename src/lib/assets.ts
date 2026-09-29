import { media } from '@/content/site'
import { vlog } from '@/lib/vidlog'

export type ProgressReporter = (progress: number) => void

/** Timeout do download do vídeo do hero: depois disso vira erro + retry. */
const HERO_TIMEOUT_MS = 60_000
/** Assets de apoio (pôster/marca) não podem segurar a página além disso. */
const WARM_TIMEOUT_MS = 8_000

/**
 * O dispositivo escolhe o vídeo da hero no momento do carregamento:
 * ≤620px ganha a cena do drone (vertical, nativa no celular); acima disso,
 * o paisagem atual — só o escolhido é baixado.
 */
const heroMedia =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 620px)').matches
    ? { src: media.hero.srcMobile, poster: media.hero.posterMobile }
    : { src: media.hero.src, poster: media.hero.poster }

/** Bytes críticos do hero — pesam na barra do preloader. */
const CRITICAL = [
  { url: heroMedia.src, weight: 0.82 },
  { url: heroMedia.poster, weight: 0.1 },
  { url: '/brand/logo.png', weight: 0.04 },
  { url: '/brand/letreiro.png', weight: 0.04 },
] as const

const WARM = CRITICAL.slice(1)

/**
 * Baixa os bytes críticos antes de liberar a página:
 * o vídeo do hero (com progresso real de bytes, guardado como objectURL para
 * não baixar duas vezes) e, em paralelo, pôster + marca aquecendo o cache.
 * O vídeo do rural não entra aqui — ele carrega sob demanda.
 */
export class MediaLoader {
  private reporters = new Set<ProgressReporter>()
  private inflight: Promise<void> | null = null
  private progress = 0
  private heroUrl: string | null = null

  getProgress(): number {
    return this.progress
  }

  /** URL pronta do hero (objectURL) com fallback para o caminho público. */
  getHeroSrc(): string {
    return this.heroUrl ?? heroMedia.src
  }

  /** Pôster do vídeo escolhido para esta largura de tela. */
  getHeroPoster(): string {
    return heroMedia.poster
  }

  /** Assina o progresso; o download só acontece uma vez (seguro com StrictMode). */
  preload(report: ProgressReporter): Promise<void> {
    this.reporters.add(report)
    report(this.progress)
    if (this.inflight) return this.inflight

    this.inflight = this.runPreload().catch((err) => {
      this.inflight = null
      throw err
    })
    return this.inflight
  }

  private emit(progress: number): void {
    this.progress = progress
    for (const report of this.reporters) report(progress)
  }

  private async runPreload(): Promise<void> {
    this.emit(0)

    if (!this.heroUrl) {
      const weight = CRITICAL[0].weight
      const controller = new AbortController()
      const timeout = window.setTimeout(() => {
        vlog(`preload: timeout de ${HERO_TIMEOUT_MS / 1000}s no download do vídeo — abortado`)
        controller.abort()
      }, HERO_TIMEOUT_MS)

      try {
        const res = await fetch(CRITICAL[0].url, { cache: 'force-cache', signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status} ${CRITICAL[0].url}`)

        const total = Number(res.headers.get('content-length')) || 0
        let blob: Blob

        if (res.body && total > 0) {
          const reader = res.body.getReader()
          const chunks: BlobPart[] = []
          let received = 0
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value as unknown as BlobPart)
            received += value.byteLength
            this.emit(weight * Math.min(1, received / total))
          }
          blob = new Blob(chunks, { type: 'video/mp4' })
        } else {
          blob = await res.blob()
          this.emit(weight)
        }

        this.heroUrl = URL.createObjectURL(blob)
      } finally {
        window.clearTimeout(timeout)
      }
    }

    // pôster e marca: só aquecem o cache (com teto — nunca seguram a página)
    await Promise.all(
      WARM.map(async ({ url }) => {
        const warm = fetch(url, { cache: 'force-cache' })
          .then((r) => (r.ok ? r.arrayBuffer() : undefined))
          .catch(() => undefined)
        await Promise.race([
          warm,
          new Promise<void>((resolve) => window.setTimeout(resolve, WARM_TIMEOUT_MS)),
        ])
      }),
    )

    this.emit(1)
  }
}

export const assets = new MediaLoader()
