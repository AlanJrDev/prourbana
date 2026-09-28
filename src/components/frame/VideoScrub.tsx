import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { clamp, pingPongTime } from '@/lib/timeline'

export type VideoScrubHandle = {
  /** Leva o vídeo para um instante, em segundos. Só existe um salto por vez. */
  setTime: (time: number) => void
  /** Último instante pedido, em segundos. */
  getTime: () => number
}

type Props = {
  src: string
  poster?: string
  /** play: toca sozinho em loop · scrub: o scroll do hero controla o tempo ·
   * loop: ping-pong vai-e-volta automático */
  mode: 'play' | 'scrub' | 'loop'
  /** trecho percorrido pelo scroll, em segundos (modo scrub) */
  from?: number
  /** instante congelado quando paused (reduced motion) */
  freezeAt?: number
  /** só baixa o arquivo quando a seção se aproxima da viewport */
  lazy?: boolean
  paused?: boolean
  className?: string
}

/**
 * Vídeo no lugar da sequência de quadros.
 *  - modo play: exibição nativa — toca em loop enquanto a seção está visível,
 *    pausando fora da viewport ou com a aba escondida (hero).
 *  - modo scrub: o pai chama setTime() com o progresso do scroll; um salto por
 *    vez, sempre descartando o antigo — um seek lento nunca mostra quadro velho.
 *  - modo loop: ping-pong contínuo (sobe e desce o tempo) com pausa fora da
 *    viewport ou com a aba escondida; paused congela no freezeAt.
 *    Os saltos são limitados a LOOP_INTERVAL_MS para deixar cada quadro
 *    apresentado (o conteúdo tem 24 fps ≈ 41 ms por quadro).
 */
/** Intervalo mínimo entre saltos no modo loop (≈ taxa do conteúdo: 24 fps). */
const LOOP_INTERVAL_MS = 40

export const VideoScrub = forwardRef<VideoScrubHandle, Props>(function VideoScrub(
  { src, poster, mode, from = 0, freezeAt, lazy = false, paused = false, className },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const requestedRef = useRef<number | null>(null)
  const seekingRef = useRef(false)
  const lastIssueRef = useRef(0)
  const durationRef = useRef(0)
  const [resolvedSrc, setResolvedSrc] = useState(() => (lazy ? '' : src))

  const startSeek = useCallback(() => {
    const video = videoRef.current
    const target = requestedRef.current
    if (!video || target === null || seekingRef.current) return
    if (mode === 'loop') {
      const now = performance.now()
      if (now - lastIssueRef.current < LOOP_INTERVAL_MS) return
      lastIssueRef.current = now
    }
    if (Math.abs(video.currentTime - target) < 0.001) return
    seekingRef.current = true
    video.currentTime = target
  }, [mode])

  const setTime = useCallback(
    (time: number) => {
      const duration = durationRef.current
      // sem duração ainda (metadado a caminho): guarda o pedido mais recente
      requestedRef.current = duration > 0 ? clamp(time, 0, duration) : time
      if (duration > 0) startSeek()
    },
    [startSeek],
  )

  const getTime = useCallback(() => requestedRef.current ?? 0, [])

  useImperativeHandle(ref, () => ({ setTime, getTime }), [setTime, getTime])

  // src "sob demanda": o arquivo só entra quando a seção se aproxima
  useEffect(() => {
    if (!lazy || resolvedSrc) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setResolvedSrc(src)
        io.disconnect()
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(wrapper)
    return () => io.disconnect()
  }, [lazy, resolvedSrc, src])

  // metadados + posição inicial + fila de saltos
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onMeta = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      durationRef.current = duration
      if (duration <= 0) return
      if (requestedRef.current === null) {
        // primeira posição: início do clipe (play/scrub) ou congelado (loop pausado)
        requestedRef.current =
          mode === 'scrub'
            ? clamp(from, 0, duration)
            : mode === 'play'
              ? 0
              : clamp(freezeAt ?? duration / 2, 0, duration)
      }
      setTime(requestedRef.current)
    }
    const onSeeked = () => {
      seekingRef.current = false
      startSeek()
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('seeked', onSeeked)
    if (video.readyState >= 1) onMeta()

    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [mode, from, freezeAt, setTime, startSeek])

  // modo play: exibição nativa — toca em loop enquanto a seção está visível
  useEffect(() => {
    if (mode !== 'play' || paused) return
    const video = videoRef.current
    if (!video) return

    let inView = false
    const sync = () => {
      if (inView && !document.hidden) void video.play().catch(() => {})
      else video.pause()
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
      video.pause()
    }
  }, [mode, paused])

  // modo loop: ping-pong dirigido por rAF, pausado fora da viewport
  useEffect(() => {
    if (mode !== 'loop' || paused) return
    const video = videoRef.current
    if (!video) return

    let raf = 0
    let acc = 0
    let last = 0
    let playing = false
    let inView = false

    const step = (now: number) => {
      if (playing) acc += now - last
      last = now
      const duration = durationRef.current
      if (duration > 0) setTime(pingPongTime(acc / 1000, duration))
      raf = requestAnimationFrame(step)
    }

    const sync = () => {
      const shouldRun = inView && !document.hidden
      if (shouldRun && !playing) last = performance.now()
      playing = shouldRun
      if (shouldRun) {
        if (!raf) raf = requestAnimationFrame(step)
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
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
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mode, paused, setTime])

  return (
    <div
      ref={wrapperRef}
      className={['video-player', className].filter(Boolean).join(' ')}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="video-player__el"
        src={resolvedSrc || undefined}
        poster={poster}
        muted
        playsInline
        loop={mode === 'play'}
        preload="auto"
        disablePictureInPicture
      />
    </div>
  )
})
