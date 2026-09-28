import { media } from '@/content/site'

export type ProgressReporter = (progress: number) => void

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
      const res = await fetch(CRITICAL[0].url, { cache: 'force-cache' })
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
    }

    // pôster e marca: só aquecem o cache (rápidos, fora da barra)
    await Promise.all(
      WARM.map(async ({ url }) => {
        try {
          const res = await fetch(url, { cache: 'force-cache' })
          if (res.ok) await res.arrayBuffer()
        } catch {
          // não bloqueia a página por um asset de apoio
        }
      }),
    )

    this.emit(1)
  }
}

export const assets = new MediaLoader()
