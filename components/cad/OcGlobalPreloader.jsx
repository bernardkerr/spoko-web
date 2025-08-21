'use client'

import { useEffect } from 'react'
import { loadOc } from '@/components/cad/OcLoader'

// Mount-once preloader to initialize OpenCascade globally for the session.
// Runs after the page becomes idle (or after a short timeout fallback).
export default function OcGlobalPreloader({ mode = 'idle' /* 'idle' | 'immediate' */ }) {
  useEffect(() => {
    // Avoid multiple triggers across client boundaries
    const g = typeof globalThis !== 'undefined' ? globalThis : {}
    if (g.__spoko_oc_preload_started) return
    g.__spoko_oc_preload_started = true

    const start = () => {
      // Kick initialization; timing logs are inside OcLoader
      loadOc().catch(() => {})
    }

    if (mode === 'immediate') {
      start()
      return
    }

    const ric = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : null

    let idleId
    if (ric) {
      idleId = ric(() => start(), { timeout: 2000 })
      return () => { try { window.cancelIdleCallback?.(idleId) } catch {} }
    } else {
      const t = setTimeout(start, 600)
      return () => clearTimeout(t)
    }
  }, [mode])

  return null
}
