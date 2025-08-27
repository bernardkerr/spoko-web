'use client'

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'

// Reusable Ace editor wrapper (loads Ace from CDN).
// - Supports language selection (defaults to javascript)
// - Persists to localStorage when storageKey provided
// - Exposes getValue/setValue/focus via ref
export const CodeEditor = forwardRef(function CodeEditor(
  { initialCode = '', storageKey, height = 320, language = 'javascript', onChange },
  ref
) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const [ready, setReady] = useState(false)

  // Load scripts once
  useEffect(() => {
    let cancelled = false

    const ensureScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-src="${src}"]`)) return resolve()
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.dataset.src = src
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })

    const loadAce = async () => {
      try {
        const base = 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict'
        await ensureScript(`${base}/ace.js`)
        await ensureScript(`${base}/ext-language_tools.js`)
        // Themes for dark/light
        await ensureScript(`${base}/theme-monokai.js`)
        await ensureScript(`${base}/theme-chrome.js`)
        // Load mode based on language prop (fallback to javascript)
        const mode = typeof language === 'string' && language ? language.toLowerCase() : 'javascript'
        const safeMode = /[^a-z0-9_]/i.test(mode) ? 'javascript' : mode
        await ensureScript(`${base}/mode-${safeMode}.js`).catch(() => ensureScript(`${base}/mode-javascript.js`))
        if (cancelled) return
        setReady(true)
      } catch (e) {
        console.error(e)
      }
    }

    loadAce()
    return () => { cancelled = true }
  }, [language])

  // init editor
  useEffect(() => {
    if (!ready || !containerRef.current) return
    const ace = window.ace
    if (!ace) return

    const editor = ace.edit(containerRef.current)
    const applyTheme = (themeStr) => {
      try { editor.setTheme(themeStr) } catch {}
    }
    // Choose theme from localStorage 'theme' (dark|light). Default: light
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const isDark = saved === 'dark'
    applyTheme(isDark ? 'ace/theme/monokai' : 'ace/theme/chrome')

    // Set language mode
    const mode = typeof language === 'string' && language ? language.toLowerCase() : 'javascript'
    const safeMode = /[^a-z0-9_]/i.test(mode) ? 'javascript' : mode
    try { editor.session.setMode(`ace/mode/${safeMode}`) } catch { editor.session.setMode('ace/mode/javascript') }

    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      tabSize: 2,
      useSoftTabs: true,
      fontSize: 13,
    })

    // load value
    const startValue = storageKey ? (localStorage.getItem(storageKey) ?? initialCode) : initialCode
    editor.setValue(startValue, -1)

    const onChangeEditor = () => {
      const val = editor.getValue()
      if (storageKey) localStorage.setItem(storageKey, val)
      onChange?.(val)
    }
    editor.session.on('change', onChangeEditor)

    // Respond to global theme changes (from ThemeToggle via 'theme-change')
    const onThemeChange = (e) => {
      const next = e?.detail?.theme === 'dark' ? 'dark' : 'light'
      applyTheme(next === 'dark' ? 'ace/theme/monokai' : 'ace/theme/chrome')
    }
    window.addEventListener('theme-change', onThemeChange)

    editorRef.current = editor

    return () => {
      editor.session.off('change', onChangeEditor)
      window.removeEventListener('theme-change', onThemeChange)
      editor.destroy()
      editorRef.current = null
    }
  }, [ready, initialCode, storageKey, onChange, language])

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue?.() ?? '',
    setValue: (code) => {
      if (!editorRef.current) return
      editorRef.current.setValue(code ?? '', -1)
      if (storageKey) localStorage.setItem(storageKey, code ?? '')
    },
    focus: () => editorRef.current?.focus?.(),
  }))

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 8,
        border: '1px solid var(--gray-a6)',
        overflow: 'hidden',
      }}
    />
  )
})
