import React from 'react'
import { D2Workbench } from '@/components/d2/D2Workbench'

export const metadata = {
  title: 'D2 Workbench Test',
  description: 'Interactive D2 diagram editor and live preview',
}

export default function D2TestPage() {
  const sample = `
# Example: Simple flow
# (Global styling can be adjusted via toolbar controls)

x: Start
x.shape: circle

y: Process
z: End

x -> y: next
y -> z: finish

# container example
Group: {
  a: Alpha
  b: Beta
  a -> b
}
`

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>D2 Workbench (Test)</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        Live-edit D2 source and render to SVG. Adjust sketch, pad, scale, and theme IDs.
      </p>
      <D2Workbench id="d2-test-1" initialCode={sample} autoRun={true} showEditorDefault={true} />
    </div>
  )
}
