'use client'

import dynamic from 'next/dynamic'

// Lazy load the workbench on the client
const ThreeWorkbench = dynamic(() => import('@/components/three/ThreeWorkbench').then(m => m.ThreeWorkbench), { ssr: false })

// Simple stable hash for strings
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export default function ThreeBlock({ code = '', idPrefix = 'mdx-three', params }) {
  const id = `${idPrefix}-${hashString(code)}`
  const ui = {
    ...(params || {}),
    ...(params?.name ? { exportName: params.name } : {}),
  }
  const autoRun = params?.autoRun !== false
  const showEditorDefault = !!params?.showEditor

  return (
    <div className="not-prose" style={{ display: 'block', width: '100%', minWidth: 0 }}>
      <ThreeWorkbench
        id={id}
        initialCode={code}
        autoRun={autoRun}
        showEditorDefault={showEditorDefault}
        ui={ui}
      />
    </div>
  )
}
