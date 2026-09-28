import { useState } from 'react'
import { startLenis } from '@/lib/lenis'
import { prefersReducedMotion } from '@/lib/motion'
import { useAssetLoader } from '@/hooks/useAssetLoader'
import { Preloader } from '@/components/preloader/Preloader'
import { Site } from '@/components/Site'

export default function App() {
  const { progress, status, retry } = useAssetLoader()
  const [ready, setReady] = useState(false)

  const onDone = () => {
    if (!prefersReducedMotion()) startLenis()
    setReady(true)
  }

  return (
    <>
      {ready && <Site />}
      {!ready && (
        <Preloader progress={progress} status={status} onDone={onDone} onRetry={retry} />
      )}
    </>
  )
}
