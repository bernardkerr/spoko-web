'use client'

import { useRef } from 'react'
import { loadOc as loadOcRaw } from '@/components/cad/OcLoader'

// Simple shared cache across all instances to avoid re-loading WASM
let ocModulePromise = null

export function useOcModuleCache() {
  const lastRef = useRef(null)

  const loadOc = async () => {
    if (lastRef.current) return lastRef.current
    if (!ocModulePromise) ocModulePromise = loadOcRaw()
    const mod = await ocModulePromise
    lastRef.current = mod
    return mod
  }

  return { loadOc }
}
