'use client'

import { useState, useEffect } from 'react'
import { Box, Card, Text, ScrollArea } from '@radix-ui/themes'

export default function FloatingTOC({ minHeadings = 3 }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState('top') // 'top' | 'middle' | 'bottom' | 'hidden'

  useEffect(() => {
    // Extract headings from the page
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const used = new Set()
      const slugify = (str) => {
        return (str || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      }
      const ensureId = (el) => {
        if (el.id) { used.add(el.id); return el.id }
        const base = slugify(el.textContent)
        let candidate = base || 'section'
        let i = 1
        while (used.has(candidate) || document.getElementById(candidate)) {
          i += 1
          candidate = `${base || 'section'}-${i}`
        }
        el.id = candidate
        used.add(candidate)
        return candidate
      }
      const headingData = Array.from(headingElements)
        // Exclude headings that live inside containers explicitly marked to be ignored by TOC
        .filter((el) => !el.closest('[data-toc-exclude]'))
        .map((heading) => {
          const id = ensureId(heading)
          return {
            id,
            text: heading.textContent,
            level: parseInt(heading.tagName.charAt(1)),
            element: heading
          }
        })
        .filter(heading => heading.id)

      setHeadings(headingData)
      setIsVisible(headingData.length >= minHeadings)
    }

    // Wait for content to be rendered
    const timer = setTimeout(extractHeadings, 100)
    return () => clearTimeout(timer)
  }, [minHeadings])

  useEffect(() => {
    if (headings.length === 0) return

    // Set up IntersectionObserver for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id)

        if (visibleHeadings.length > 0) {
          // Set the first visible heading as active
          setActiveId(visibleHeadings[0])
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px', // Trigger when heading is near top
        threshold: 0
      }
    )

    headings.forEach(heading => {
      if (heading.element) {
        observer.observe(heading.element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  // Persisted placement across the site
  useEffect(() => {
    try {
      const saved = localStorage.getItem('floatingTOCPosition')
      if (saved && ['top', 'middle', 'bottom', 'hidden'].includes(saved)) {
        setPosition(saved)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // When the mobile hamburger requests the TOC, ensure we switch to 'top'
  useEffect(() => {
    const onMobileTocOpen = () => setPosition('top')
    try {
      window.addEventListener('mobile-toc-open', onMobileTocOpen)
    } catch {}
    return () => {
      try { window.removeEventListener('mobile-toc-open', onMobileTocOpen) } catch {}
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('floatingTOCPosition', position)
    } catch (e) {
      // ignore
    }
  }, [position])

  const handleHeadingClick = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    // Notify listeners (MobileTOC) to close the overlay on selection
    try {
      window.dispatchEvent(new Event('floating-toc-select'))
    } catch {}
  }

  const cyclePosition = () => {
    setPosition(prev => (
      prev === 'top' ? 'middle' :
      prev === 'middle' ? 'bottom' :
      prev === 'bottom' ? 'hidden' :
      'top'
    ))
  }

  // Compute placement styles
  const placementStyle = (() => {
    const common = {
      zIndex: 9999,
      maxWidth: '280px',
      width: '280px'
    }
    if (position === 'top') {
      return {
        ...common,
        top: 'calc(80px + 2rem)', // Header height + spacing
        bottom: 'auto',
        transform: 'none'
      }
    }
    if (position === 'middle') {
      return {
        ...common,
        top: '50%',
        bottom: 'auto',
        transform: 'translateY(-50%)'
      }
    }
    return {
      ...common,
      top: 'auto',
      bottom: '2rem',
      transform: 'none'
    }
  })()

  if (!isVisible) return null

  // Hidden mode: show only the tiny glyph in the page's top-right; clicking reveals TOC at top
  if (position === 'hidden') {
    return (
      <div
        className="floating-toc-toggle-alone hidden lg:block"
        role="button"
        title="Show table of contents"
        aria-label="Show table of contents"
        tabIndex={0}
        onClick={() => setPosition('top')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setPosition('top')
          }
        }}
      >
        {/* Indicate top as the target state when revealing */}
        {['top', 'middle', 'bottom'].map((pos) => (
          <span
            key={pos}
            className={`line ${pos === 'top' ? 'active' : ''}`}
          />
        ))}
      </div>
    )
  }

  return (
    <Box
      position="fixed"
      right="4"
      style={placementStyle}
      className="floating-toc hidden lg:block" // Hide on mobile/tablet
    >
      {/* Hover-only tiny placement toggle */}
      <div
        className="toc-toggle"
        onClick={cyclePosition}
        title="Toggle TOC placement"
        aria-label="Toggle table of contents placement"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            cyclePosition()
          }
        }}
      >
        {['top', 'middle', 'bottom'].map((pos) => (
          <span
            key={pos}
            className={`line ${position === pos ? 'active' : ''}`}
          />
        ))}
      </div>
      <Card size="2" className="floating-toc-card">
        <Box p="3">
          <Text size="2" weight="medium" color="gray" mb="3" as="div">
            Contents
          </Text>
          <ScrollArea type="hover" style={{ maxHeight: '60vh' }}>
            <Box as="nav">
              {headings.map((heading) => (
                <Box
                  key={heading.id}
                  mb="1"
                  style={{
                    paddingLeft: `${(heading.level - 1) * 12}px`
                  }}
                >
                  <Text
                    size="1"
                    as="button"
                    onClick={() => handleHeadingClick(heading.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: 'none',
                      background: 'none',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-2)',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      outline: 'none',
                      textDecoration: 'none',
                      color: activeId === heading.id 
                        ? 'var(--accent-11)' 
                        : 'var(--gray-12)',
                      backgroundColor: activeId === heading.id 
                        ? 'var(--accent-3)' 
                        : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeId !== heading.id) {
                        e.target.style.backgroundColor = 'var(--gray-4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeId !== heading.id) {
                        e.target.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {heading.text}
                  </Text>
                </Box>
              ))}
            </Box>
          </ScrollArea>
        </Box>
      </Card>
    </Box>
  )
}

