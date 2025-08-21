'use client'

import { useRef, useCallback } from 'react'

export function useLastGoodCode(id, initialCode) {
  const CODE_KEY = `cad:${id}:code`
  const LAST_GOOD_KEY = `cad:${id}:last-good`
  const lastGoodRef = useRef(null)

  const read = useCallback(() => {
    if (typeof window === 'undefined') return { code: initialCode, lastGood: initialCode }
    const storedCode = localStorage.getItem(CODE_KEY)
    const storedGood = localStorage.getItem(LAST_GOOD_KEY)
    const code = (storedCode && storedCode.length > 0) ? storedCode : initialCode
    const lastGood = (storedGood && storedGood.length > 0) ? storedGood : initialCode
    lastGoodRef.current = lastGood
    return { code, lastGood }
  }, [CODE_KEY, LAST_GOOD_KEY, initialCode])

  const writeCode = useCallback((code) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(CODE_KEY, code ?? '')
  }, [CODE_KEY])

  const writeLastGood = useCallback((code) => {
    if (typeof window === 'undefined') return
    lastGoodRef.current = code ?? ''
    localStorage.setItem(LAST_GOOD_KEY, code ?? '')
  }, [LAST_GOOD_KEY])

  const resolveSource = useCallback((editorGetValue) => {
    if (typeof window !== 'undefined') {
      const lg = localStorage.getItem(LAST_GOOD_KEY)
      if (lg && lg.trim().length > 0) return lg
    }
    const current = editorGetValue?.()
    if (current && typeof current === 'string') return current
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CODE_KEY)
      if (saved && saved.trim().length > 0) return saved
    }
    return initialCode
  }, [CODE_KEY, LAST_GOOD_KEY, initialCode])

  return {
    CODE_KEY,
    LAST_GOOD_KEY,
    lastGoodRef,
    read,
    writeCode,
    writeLastGood,
    resolveSource,
  }
}
