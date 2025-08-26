'use client'

import dynamic from 'next/dynamic'

// Lazy load the workbench on the client
const D3Workbench = dynamic(() => import('@/components/d3/D3Workbench').then(m => m.D3Workbench), { ssr: false })

// Simple stable hash for strings
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export default function D3Block({ code = '', idPrefix = 'mdx-d3', params }) {
  const id = `${idPrefix}-${hashString(code)}`
  const ui = {
    ...(params || {}),
    ...(params?.name ? { exportName: params.name } : {}),
  }
  const autoRun = params?.autoRun !== false
  const showEditorDefault = !!(params?.workbench || params?.showEditor)

  return (
    <div className="not-prose" style={{ display: 'block', width: '100%', minWidth: 0 }}>
      <D3Workbench
        id={id}
        initialCode={code}
        autoRun={autoRun}
        showEditorDefault={showEditorDefault}
        ui={ui}
      />
    </div>
  )
}
