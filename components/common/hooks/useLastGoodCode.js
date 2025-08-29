'use client'

import { useRef, useCallback } from 'react'

// Reusable persistence hook with namespaced keys
// ns: short namespace string like 'd3', 'svg', 'cad'
export function useLastGoodCode(ns, id, initialCode) {
  const CODE_KEY = `${ns}:${id}:code`
  const LAST_GOOD_KEY = `${ns}:${id}:last-good`
  const ORIG_HASH_KEY = `${ns}:${id}:orig-hash`
  const lastGoodRef = useRef(null)

  // Small, fast hash for strings (32-bit)
  const hashString = useCallback((str) => {
    try {
      let h = 5381
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i)
      }
      // Force to unsigned 32-bit and to string for storage
      return (h >>> 0).toString(36)
    } catch {
      return '0'
    }
  }, [])

  const read = useCallback(() => {
    if (typeof window === 'undefined') return { code: initialCode, lastGood: initialCode }

    // Invalidate persisted edits when the original source changes
    try {
      const currentHash = hashString(String(initialCode ?? ''))
      const storedHash = localStorage.getItem(ORIG_HASH_KEY)
      if (storedHash !== currentHash) {
        // Original changed: drop user overrides and last-good
        try { localStorage.removeItem(CODE_KEY) } catch {}
        try { localStorage.removeItem(LAST_GOOD_KEY) } catch {}
        try { localStorage.setItem(ORIG_HASH_KEY, currentHash) } catch {}
      }
    } catch {}

    const storedCode = localStorage.getItem(CODE_KEY)
    const storedGood = localStorage.getItem(LAST_GOOD_KEY)
    const code = (storedCode && storedCode.length > 0) ? storedCode : initialCode
    const lastGood = (storedGood && storedGood.length > 0) ? storedGood : initialCode
    lastGoodRef.current = lastGood
    return { code, lastGood }
  }, [CODE_KEY, LAST_GOOD_KEY, ORIG_HASH_KEY, initialCode, hashString])

  const writeCode = useCallback((code) => {
    if (typeof window === 'undefined') return
    try {
      // Ensure orig-hash is present so future reads don't nuke fresh writes
      const currentHash = (typeof initialCode === 'string') ? hashString(initialCode) : hashString('')
      if (!localStorage.getItem(ORIG_HASH_KEY)) localStorage.setItem(ORIG_HASH_KEY, currentHash)
    } catch {}
    localStorage.setItem(CODE_KEY, code ?? '')
  }, [CODE_KEY, ORIG_HASH_KEY, initialCode, hashString])

  const writeLastGood = useCallback((code) => {
    if (typeof window === 'undefined') return
    lastGoodRef.current = code ?? ''
    try {
      const currentHash = (typeof initialCode === 'string') ? hashString(initialCode) : hashString('')
      if (!localStorage.getItem(ORIG_HASH_KEY)) localStorage.setItem(ORIG_HASH_KEY, currentHash)
    } catch {}
    localStorage.setItem(LAST_GOOD_KEY, code ?? '')
  }, [LAST_GOOD_KEY, ORIG_HASH_KEY, initialCode, hashString])

  const resolveSource = useCallback((editorGetValue) => {
    const current = editorGetValue?.()
    if (current && typeof current === 'string' && current.trim().length > 0) return current

    if (typeof window !== 'undefined') {
      const lg = localStorage.getItem(LAST_GOOD_KEY)
      if (lg && lg.trim().length > 0) return lg
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CODE_KEY)
      if (saved && saved.trim().length > 0) return saved
    }

    return initialCode
  }, [CODE_KEY, LAST_GOOD_KEY, initialCode])

  return {
    CODE_KEY,
    LAST_GOOD_KEY,
    ORIG_HASH_KEY,
    lastGoodRef,
    read,
    writeCode,
    writeLastGood,
    resolveSource,
  }
}
