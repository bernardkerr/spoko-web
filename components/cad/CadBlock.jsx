'use client'

import { CadWorkbench } from '@/components/cad/CadWorkbench'

// Simple stable hash for strings
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  // convert to unsigned base36 for compactness
  return Math.abs(h).toString(36)
}

export default function CadBlock({ code = '', idPrefix = 'mdx-cad', initialViewer, params }) {
  // Allow MDX fences that use module syntax like `export function buildModel`.
  const sanitized = (code || '')
    .replace(/^\s*export\s+default\s+function\s+buildModel/m, 'function buildModel')
    .replace(/^\s*export\s+function\s+buildModel/m, 'function buildModel')
  const id = `${idPrefix}-${hashString(sanitized)}`
  return (
    <CadWorkbench
      id={id}
      initialCode={sanitized}
      autoRun={true}
      showEditorDefault={false}
      initialViewer={initialViewer || { spinEnabled: true, frameMode: 'HIDE', shadingMode: 'GRAY', originVisible: false }}
      ui={{
        ...(params || {}),
        // Prefer explicit fence name as exportName if present
        ...(params?.name ? { exportName: params.name } : {}),
      }}
    />
  )
}
