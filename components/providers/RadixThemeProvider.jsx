'use client'

import { useEffect, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { IBM_Plex_Mono } from 'next/font/google'

// Next.js font loaders must be called at module scope
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

/**
 * RadixThemeProvider
 * - Bridges existing 'light'/'dark' localStorage + html.dark class to Radix Themes appearance.
 * - Listens to a custom `theme-change` event for live updates from `ThemeToggle`.
 */
export default function RadixThemeProvider({ children }) {
  const [appearance, setAppearance] = useState('light')

  useEffect(() => {
    // Initialize from existing localStorage convention
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const initial = saved === 'dark' ? 'dark' : 'light'
    setAppearance(initial)

    const handler = (e) => {
      const next = e?.detail?.theme === 'dark' ? 'dark' : 'light'
      setAppearance(next)
    }
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [])

  return (
    <Theme
      appearance={appearance}
      accentColor="iris"
      radius="large"
      className={ibmPlexMono.className}
      style={{
        '--default-font-family': ibmPlexMono.style.fontFamily,
        '--code-font-family': ibmPlexMono.style.fontFamily,
      }}
    >
      {children}
    </Theme>
  )
}
