'use client'

import { useState, useEffect } from 'react'
import { Box, Card, Text, ScrollArea } from '@radix-ui/themes'

export default function FloatingTOC({ minHeadings = 3 }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Extract headings from the page
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const headingData = Array.from(headingElements).map((heading) => ({
        id: heading.id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading
      })).filter(heading => heading.id) // Only include headings with IDs

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

  const handleHeadingClick = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  if (!isVisible) return null

  return (
    <Box
      position="fixed"
      right="4"
      style={{ 
        top: 'calc(80px + 2rem)', // Header height + spacing
        zIndex: 9999,
        maxWidth: '280px',
        width: '280px'
      }}
      className="hidden lg:block" // Hide on mobile/tablet
    >
      <Card size="2" style={{ backgroundColor: 'var(--color-panel-solid)' }}>
        <Box p="3">
          <Text size="2" weight="medium" color="gray" mb="3" as="div">
            Contents
          </Text>
          <ScrollArea style={{ maxHeight: '60vh' }}>
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
                      background: 'none',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-2)',
                      cursor: 'pointer',
                      color: activeId === heading.id 
                        ? 'var(--accent-11)' 
                        : 'var(--gray-11)',
                      backgroundColor: activeId === heading.id 
                        ? 'var(--accent-3)' 
                        : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeId !== heading.id) {
                        e.target.style.backgroundColor = 'var(--gray-3)'
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
