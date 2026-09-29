import { media } from '@/content/site'
import { vlog } from '@/lib/vidlog'

export type ProgressReporter = (progress: number) => void

/** Timeout de cada download grande (hero e rural): depois disso vira erro + retry. */
const DOWNLOAD_TIMEOUT_MS = 60_000
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

/**
 * Os DOIS vídeos da visita bloqueiam a abertura: é o que garante zero
 * download de rede durante a rolagem (ambos viram objectURL em memória).
 * Pesos da barra: hero ≈45%, rural ≈50%; pôster/marca fecham os5%
 * restantes só aquecendo o cache (com teto — nunca seguram a página).
 */
const BLOCKING = [
  { url: heroMedia.src, weight: 0.45, label: 'hero' },
  { url: media.rural.src, weight: 0.5, label: 'rural' },
] as const

const WARM = [heroMedia.poster, media.rural.poster, '/brand/logo.png', '/brand/letreiro.png'] as const

/**
 * Baixa os bytes críticos antes de liberar a página: o vídeo do hero e o do
 * rural, com progresso real de bytes, guardados como objectURL para não
 * baixar duas vezes. Pôster + marca aquecem o cache em paralelo, com teto.
 */
export class MediaLoader {
  private reporters = new Set<ProgressReporter>()
  private inflight: Promise<void> | null = null
  private progress = 0
  private heroUrl: string | null = null
  private ruralUrl: string | null = null

  getProgress(): number {
    return this.progress
  }

  /** URL pronta do hero (objectURL) com fallback para o caminho público. */
  getHeroSrc(): string {
    return this.heroUrl ?? heroMedia.src
  }

  /** URL pronta do rural (objectURL) — já baixada durante o preloader. */
  getRuralSrc(): string {
    return this.ruralUrl ?? media.rural.src
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

  /** Baixa um vídeo inteiro para um objectURL, reportando bytes reais na barra. */
  private async download(url: string, weight: number, label: string): Promise<string> {
    const base = this.progress
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      vlog(`preload: timeout de ${DOWNLOAD_TIMEOUT_MS / 1000}s no download do ${label} — abortado`)
      controller.abort()
    }, DOWNLOAD_TIMEOUT_MS)

    try {
      const res = await fetch(url, { cache: 'force-cache', signal: controller.signal })
      if (!res.ok) throw new Error(`${res.status} ${url}`)

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
          this.emit(base + weight * Math.min(1, received / total))
        }
        blob = new Blob(chunks, { type: 'video/mp4' })
      } else {
        blob = await res.blob()
        this.emit(base + weight)
      }

      vlog(`preload: ${label} pronto em blob (${Math.round(blob.size / 1024)} KB)`)
      return URL.createObjectURL(blob)
    } finally {
      window.clearTimeout(timeout)
    }
  }

  private async runPreload(): Promise<void> {
    this.emit(0)

    // hero e rural em sequência, ANTES de liberar a página (é a garantia)
    if (!this.heroUrl) {
      this.heroUrl = await this.download(BLOCKING[0].url, BLOCKING[0].weight, BLOCKING[0].label)
    }
    if (!this.ruralUrl) {
      this.ruralUrl = await this.download(BLOCKING[1].url, BLOCKING[1].weight, BLOCKING[1].label)
    }

    // pôster e marca: só aquecem o cache (com teto — nunca seguram a página)
    await Promise.all(
      WARM.map(async (url) => {
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
