import { useCallback, useEffect, useRef, useState } from 'react'
import { assets, type ProgressReporter } from '@/lib/assets'

export type LoaderStatus = 'loading' | 'ready' | 'error'

/**
 * Carrega os bytes críticos (vídeo do hero, pôster e marca) antes de liberar
 * a página. Seguro com o StrictMode: o download roda uma única vez.
 */
export function useAssetLoader() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<LoaderStatus>('loading')
  const unsubscribed = useRef(false)

  useEffect(() => {
    unsubscribed.current = false
    const report: ProgressReporter = (value) => {
      if (unsubscribed.current) return
      setProgress(value)
      if (value >= 1) setStatus('ready')
    }

    assets
      .preload(report)
      .then(() => {
        if (!unsubscribed.current) setStatus('ready')
      })
      .catch((err) => {
        console.error('[loader]', err)
        if (!unsubscribed.current) setStatus('error')
      })

    return () => {
      unsubscribed.current = true
    }
  }, [])

  const retry = useCallback(() => {
    setStatus('loading')
    setProgress(0)
    assets.preload((v) => {
      setProgress(v)
      if (v >= 1) setStatus('ready')
    }).catch(() => setStatus('error'))
  }, [])

  return { progress, status, retry }
}
