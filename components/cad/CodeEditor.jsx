'use client'

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'

// Lightweight Ace wrapper that loads ace from CDN and initializes a JS editor.
// Exposes getValue/setValue via ref. Persists to localStorage if storageKey is provided.
export const CodeEditor = forwardRef(function CodeEditor(
  { initialCode = '', storageKey, height = 320, onChange },
  ref
) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const [ready, setReady] = useState(false)

  // Load scripts once
  useEffect(() => {
    let cancelled = false

    const ensureScript = (src) => new Promise((resolve, reject) => {
      // already present
      if (document.querySelector(`script[data-src="${src}"]`)) return resolve()
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.dataset.src = src
      s.onload = () => resolve()
      s.onerror = (e) => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })

    const loadAce = async () => {
      try {
        await ensureScript('https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict/ace.js')
        await ensureScript('https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict/ext-language_tools.js')
        await ensureScript('https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict/mode-javascript.js')
        // Themes for dark/light
        await ensureScript('https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict/theme-monokai.js')
        await ensureScript('https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min-noconflict/theme-chrome.js')
        if (cancelled) return
        setReady(true)
      } catch (e) {
        console.error(e)
      }
    }

    loadAce()
    return () => { cancelled = true }
  }, [])

  // init editor
  useEffect(() => {
    if (!ready || !containerRef.current) return
    const ace = window.ace
    if (!ace) return

    const editor = ace.edit(containerRef.current)
    const applyTheme = (themeStr) => {
      try {
        editor.setTheme(themeStr)
      } catch (e) {
        // no-op if theme not loaded yet
      }
    }
    // Choose theme from localStorage 'theme' (dark|light). Default: light
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const isDark = saved === 'dark'
    applyTheme(isDark ? 'ace/theme/monokai' : 'ace/theme/chrome')
    editor.session.setMode('ace/mode/javascript')
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
  }, [ready, initialCode, storageKey, onChange])

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
