'use client'

import { D2Workbench } from '@/components/d2/D2Workbench'

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

export default function D2Block({ code = '', idPrefix = 'mdx-d2', params }) {
  const id = `${idPrefix}-${hashString(code)}`
  const ui = {
    ...(params || {}),
    ...(params?.name ? { exportName: params.name } : {}),
  }
  const autoRun = params?.autoRun !== false
  const showEditorDefault = !!(params?.workbench || params?.showEditor)

  return (
    <div className="not-prose" style={{ display: 'block', width: '100%', minWidth: 0 }}>
      <D2Workbench
        id={id}
        initialCode={code}
        autoRun={autoRun}
        showEditorDefault={showEditorDefault}
        ui={ui}
      />
    </div>
  )
}
