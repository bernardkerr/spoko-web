'use client'

import { useEffect } from 'react'
import { getOcWorker } from '@/components/cad/workers/ocWorkerClient'

export default function OcWorkerBootstrap() {
  useEffect(() => {
    // Ensure singleton worker is created on app start
    const w = getOcWorker()
    // Optionally, listen once for initial ready
    const onMessage = (ev) => {
      if (ev?.data?.type === 'ready') {
        // console.log('[OC Worker] ready')
        w.removeEventListener('message', onMessage)
      }
    }
    w.addEventListener?.('message', onMessage)
  }, [])
  return null
}
