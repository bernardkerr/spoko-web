"use client"

import React from 'react'
import { getAssetPath } from '@/lib/paths'

export default function MDXImage(props) {
  const { src = '', alt = '', ...rest } = props
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
  return <img src={finalSrc} alt={alt} {...rest} />
}
