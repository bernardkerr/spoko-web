'use client'

import dynamic from 'next/dynamic'

const SVGWorkbench = dynamic(() => import('@/components/svg/SVGWorkbench').then(m => m.SVGWorkbench), { ssr: false })

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export default function SVGBlock({ code = '', idPrefix = 'mdx-svg', params }) {
  const id = `${idPrefix}-${hashString(code)}`
  const ui = {
    ...(params || {}),
    ...(params?.name ? { exportName: params.name } : {}),
  }
  const autoRun = params?.autoRun !== false
  const showEditorDefault = !!(params?.workbench || params?.showEditor)

  return (
    <div className="not-prose" style={{ display: 'block', width: '100%', minWidth: 0 }}>
      <SVGWorkbench
        id={id}
        initialCode={code}
        autoRun={autoRun}
        showEditorDefault={showEditorDefault}
        ui={ui}
      />
    </div>
  )
}
