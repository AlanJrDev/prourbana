import { useEffect, useRef } from 'react'
import { vlog } from '@/lib/vidlog'

type Props = {
  /** Caminho do vídeo — sempre um blob do preloader (já em memória). */
  src: string
  poster?: string
  className?: string
}

/** Novas tentativas de play() quando o navegador/app bloqueia a primeira (ms). */
const PLAY_DELAYS_MS = [1000, 3000, 7000]

/**
 * Player padrão único do site (hero e rural) — regra igual pra todo vídeo,
 * em qualquer aparelho e qualquer formato de tela:
 *  - o src vem do preloader em blob e monta direto (sem lazy, sem escolha
 *    de modo: é sempre exibição — toca sozinho em loop);
 *  - inicia sempre, mesmo com prefers-reduced-motion ligado (nenhum conflito
 *    de acessibilidade congela o vídeo);
 *  - pausa só quando sai da viewport ou a aba some, e volta sozinho;
 *  - se o navegador bloquear o play(), tenta de novo (backoff) e no fim arma
 *    retry no primeiro toque — nunca morre silencioso;
 *  - erro de mídia ganha um reload antes de desistir (o poster permanece).
 */
export function VideoScrub({ src, poster, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // erro de mídia: um reload antes de desistir (poster permanece)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let retries = 0
    const onError = () => {
      const code = video.error?.code ?? 0
      vlog(`erro de mídia (code=${code})`)
      if (retries < 1 && (video.currentSrc || video.src)) {
        retries += 1
        vlog(`reload do vídeo (tentativa ${retries})`)
        video.load()
      } else {
        vlog('reload desistiu — poster permanece')
      }
    }
    video.addEventListener('error', onError)
    return () => video.removeEventListener('error', onError)
  }, [src])

  // play sozinho enquanto a seção está visível; backoff + retry por interação
  // quando o navegador/app bloqueia — nunca morre silencioso
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let inView = false
    let tries = 0
    let timer: number | undefined
    let onRetrySignal: (() => void) | undefined

    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer)
        timer = undefined
      }
    }
    const stopInteractionRetry = () => {
      if (!onRetrySignal) return
      window.removeEventListener('pointerdown', onRetrySignal)
      document.removeEventListener('visibilitychange', onRetrySignal)
      onRetrySignal = undefined
    }
    const armInteractionRetry = () => {
      if (onRetrySignal) return
      onRetrySignal = () => {
        vlog('play: retry por interação/visibilidade')
        tries = 0
        stopInteractionRetry()
        attempt()
      }
      window.addEventListener('pointerdown', onRetrySignal, { once: true })
      document.addEventListener('visibilitychange', onRetrySignal, { once: true })
    }
    const attempt = () => {
      if (!inView || document.hidden) return
      video
        .play()
        .then(() => {
          vlog(tries === 0 ? 'play: tocando' : `play: ok após ${tries} retry(s)`)
          tries = 0
        })
        .catch((err: unknown) => {
          if (tries < PLAY_DELAYS_MS.length) {
            const delay = PLAY_DELAYS_MS[tries]
            tries += 1
            vlog(`play: bloqueado (tentativa ${tries}) ${String(err)} — retry em ${delay}ms`)
            clearTimer()
            timer = window.setTimeout(attempt, delay)
          } else {
            vlog(`play: desistiu (${String(err)}) — aguardando interação`)
            armInteractionRetry()
          }
        })
    }

    const sync = () => {
      if (inView && !document.hidden) attempt()
      else {
        clearTimer()
        tries = 0
        stopInteractionRetry()
        video.pause()
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        sync()
      },
      { threshold: 0.05 },
    )
    io.observe(video)
    const onVisibility = () => sync()
    const onMeta = () => sync()
    document.addEventListener('visibilitychange', onVisibility)
    video.addEventListener('loadedmetadata', onMeta)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadedmetadata', onMeta)
      clearTimer()
      stopInteractionRetry()
      video.pause()
    }
  }, [src])

  return (
    <div
      className={['video-player', className].filter(Boolean).join(' ')}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="video-player__el"
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
      />
    </div>
  )
}
