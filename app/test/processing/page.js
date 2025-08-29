import React from 'react'
import { ProcessingWorkbench } from '@/components/processing/ProcessingWorkbench'

export const metadata = {
  title: 'Processing.js Workbench Test',
  description: 'Interactive Processing.js editor and live preview',
}

export default function ProcessingTestPage() {
  const sample = `// Theme-aware background grid + moving ball
function sketch(p) {
  p.setup = function() {
    p.size(width, height)
    p.background(255)
  }
  p.draw = function() {
    // panel
    p.noStroke();
    p.fill(255)
    p.rect(0,0,width,height)
    // grid
    p.stroke(220)
    for (let x = 0; x <= width; x += 40) p.line(x, 0, x, height)
    for (let y = 0; y <= height; y += 40) p.line(0, y, width, y)
    // moving ball
    const r = Math.min(width, height) * 0.35
    const cx = width/2, cy = height/2
    const t = p.frameCount * 0.03
    const x = cx + Math.cos(t) * r
    const y = cy + Math.sin(t) * r
    // rotating text instead of a dot
    p.noStroke()
    p.fill(0) // high contrast (black)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(48)
    p.text('Bernard', x, y + 20)

    // debug marker: if you see this but not the text, a font issue remains
    p.fill(0, 120, 255)
    p.ellipse(x, y, 6, 6)
  }
}
return sketch`

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Processing.js Workbench (Test)</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        Live-edit Processing.js code and render to a canvas. Use a function <code>sketch(p)</code> returning setup/draw.
      </p>
      <ProcessingWorkbench id="processing-test-1" initialCode={sample} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 460 }} />
    </div>
  )
}
