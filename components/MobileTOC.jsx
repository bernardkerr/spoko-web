"use client"

import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'

export default function MobileTOC({ minHeadings = 3 }) {
  const [hasTOC, setHasTOC] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Re-check headings a few times to account for async page rendering
    const check = () => {
      const hs = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
        .map((el) => el.id)
        .filter(Boolean)
      setHasTOC(hs.length >= minHeadings)
    }
    const t1 = setTimeout(check, 100)
    const t2 = setTimeout(check, 400)
    const t3 = setTimeout(check, 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [minHeadings, pathname])

  useEffect(() => {
    const root = document.documentElement
    if (open) {
      root.classList.add("mobile-toc-open")
      try {
        localStorage.setItem('floatingTOCPosition', 'top')
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent('mobile-toc-open'))
      } catch {}
      // If TOC is in 'hidden' mode, its standalone toggle will be present; click it to reveal at top
      // Try immediately and then once more on the next tick in case it hasn't mounted yet
      const clickHiddenToggle = () => {
        const toggle = document.querySelector('.floating-toc-toggle-alone')
        if (toggle && typeof toggle.click === 'function') {
          toggle.click()
          return true
        }
        return false
      }
      if (!clickHiddenToggle()) {
        setTimeout(clickHiddenToggle, 50)
      }
    } else {
      root.classList.remove("mobile-toc-open")
    }
    return () => root.classList.remove("mobile-toc-open")
  }, [open])

  // When open, close after user selects a heading inside the FloatingTOC, or presses Escape
  useEffect(() => {
    if (!open) return
    const onSelected = () => setOpen(false)
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // Close on click/touch outside of the floating TOC and the hamburger button
    const onPointer = (e) => {
      const target = e.target
      const inButton = target.closest && target.closest('.mobile-toc-button')
      if (inButton) return
      // If the click is inside the floating TOC, ignore
      const tocEl = document.querySelector('.floating-toc')
      if (tocEl) {
        // Prefer bounding rect to avoid issues with closest on non-Element targets
        const r = tocEl.getBoundingClientRect()
        const x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX)
        const y = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY)
        const insideRect = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
        if (insideRect) return
      } else {
        // Fallback to closest if rect element not found but class exists on ancestors
        const inTOC = target.closest && target.closest('.floating-toc')
        if (inTOC) return
      }
      setOpen(false)
    }
    window.addEventListener('floating-toc-select', onSelected)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer, true)
    document.addEventListener('touchstart', onPointer, true)
    document.addEventListener('click', onPointer, true)
    return () => {
      window.removeEventListener('floating-toc-select', onSelected)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer, true)
      document.removeEventListener('touchstart', onPointer, true)
      document.removeEventListener('click', onPointer, true)
    }
  }, [open])

  // Close when route changes
  useEffect(() => { setOpen(false) }, [pathname])

  if (!hasTOC) return null

  return (
    <>
      <button
        type="button"
        className="mobile-toc-button"
        aria-label="Toggle table of contents"
        title="Contents"
        onClick={() => setOpen(v => !v)}
      >
        <span className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      {open && (
        <div
          className="mobile-toc-overlay"
          aria-hidden="true"
          onClick={() => setOpen(false)}
          onTouchStart={() => setOpen(false)}
        />
      )}
    </>
  )
}
