'use client'

import { useEffect, useRef, useState } from 'react'

// Starts a module worker that preloads OC assets into the HTTP cache.
// Returns a small status string: 'idle' | 'warming' | 'done' | 'error:<msg>'
export function useOcWarmupWorker() {
  const [status, setStatus] = useState('idle')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    let worker
    try {
      worker = new Worker(new URL('../workers/OcWarmupWorker.js', import.meta.url), { type: 'module' })
    } catch (e) {
      // Some environments may not support module workers (SSR/old browsers)
      return
    }

    const onMessage = (ev) => {
      const { type, message } = ev.data || {}
      if (type === 'status') setStatus('warming')
      else if (type === 'done') setStatus('done')
      else if (type === 'error') setStatus(`error:${message || 'unknown'}`)
    }

    worker.addEventListener('message', onMessage)

    // Auto-terminate once done/error to free resources
    const cleanup = () => {
      try { worker.terminate() } catch {}
    }

    worker.addEventListener('message', (ev) => {
      const { type } = ev.data || {}
      if (type === 'done' || type === 'error') cleanup()
    })

    return () => {
      worker.removeEventListener('message', onMessage)
      try { worker.terminate() } catch {}
    }
  }, [])

  return status
}
