"use client"

import React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getAssetPath } from '@/lib/paths'

export default function MDXImage(props) {
  const { src = '', alt = '', originPath, backLabel, ...rest } = props
  let resolved = src || ''

  // Normalize relative patterns used in MD content
  if (resolved.startsWith('./images/')) {
    resolved = resolved.replace('./images/', '/content/images/')
  } else if (resolved.startsWith('images/')) {
    resolved = `/content/${resolved}` // -> /content/images/...
  } else if (!resolved.startsWith('/') && !resolved.match(/^https?:\/\//)) {
    // Any other relative path -> treat as under /content/
    resolved = `/content/${resolved}`
  }

  // Prefix with basePath/assetPrefix if configured
  const finalSrc = getAssetPath(resolved)

  // If originPath is provided, wrap image with link to the viewer
  if (originPath) {
    const href = `/image-viewer?src=${encodeURIComponent(finalSrc)}&alt=${encodeURIComponent(alt || '')}&back=${encodeURIComponent(originPath)}&backLabel=${encodeURIComponent(backLabel || 'Back')}`
    return (
      <Link href={href} title={alt || 'Open full size'}
        style={{ position: 'relative', display: 'inline-block' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={finalSrc} alt={alt} {...rest} />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: 'rgba(0,0,0,0.22)',
            borderRadius: 6,
            opacity: 0,
            transition: 'opacity 150ms ease-in-out',
            pointerEvents: 'none'
          }}
          className="mdximage-zoom-overlay"
        >
          <Search size={22} />
        </div>
        <style jsx>{`
          a:hover .mdximage-zoom-overlay { opacity: 1; }
        `}</style>
      </Link>
    )
  }

  // Fallback: plain image
  return <img src={finalSrc} alt={alt} {...rest} />
}
