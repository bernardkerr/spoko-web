import React from 'react'
import { SVGWorkbench } from '@/components/svg/SVGWorkbench'

export const metadata = {
  title: 'SVG.js Workbench Test',
  description: 'Interactive SVG.js editor and live preview',
}

export default function SVGTestPage() {
  const sample = `// Shapes and text with theme colors\nconst draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)\n\n// background panel\ndraw.rect(width, height).fill('var(--color-panel-solid)').stroke({ width: 1, color: 'var(--gray-a6)' })\n\n// grid\nfor (let x = 0; x <= width; x += 40) draw.line(x, 0, x, height).stroke({ color: 'var(--gray-a3)', width: 1 })\nfor (let y = 0; y <= height; y += 40) draw.line(0, y, width, y).stroke({ color: 'var(--gray-a3)', width: 1 })\n\n// shapes\ndraw.circle(80).move(40, 40).fill('var(--accent-9)')\ndraw.rect(120, 60).move(160, 60).fill('var(--green-9)').rx(12)\ndraw.polygon('0,40 40,0 80,40 40,80').move(320,40).fill('var(--blue-9)')\n\n// text\ndraw.text('Spoko SVG.js').move(40, 160).font({ fill: 'var(--gray-12)', size: 24, family: 'ui-sans-serif, system-ui' })\n`

  const anim = `// Animation demo (pulse + motion)\nconst draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)\n\nconst g = draw.group()\nconst circle = g.circle(40).center(width/2, height/2).fill('var(--accent-9)')\nconst dot = g.circle(10).fill('#f00').center(width/2, height/2)\n\nfunction loop() {\n  circle.animate(800).attr({ r: 30 }).ease('<>').animate(800).attr({ r: 20 }).ease('<>').after(loop)\n}\nloop()\n\nlet t = 0\nconst r = Math.min(width, height) * 0.35\nfunction frame(){\n  t += 0.02\n  const x = width/2 + Math.cos(t) * r\n  const y = height/2 + Math.sin(t) * r\n  dot.center(x, y)\n  requestAnimationFrame(frame)\n}\nframe()\n`

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>SVG.js Workbench (Test)</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        Live-edit SVG.js code and render to responsive SVG. Theme variables from Radix are available via CSS vars like var(--accent-9).
      </p>
      <SVGWorkbench id="svg-test-1" initialCode={sample} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 460 }} />
      <div style={{ height: 24 }} />
      <h2 style={{ margin: '8px 0' }}>Animation</h2>
      <p style={{ color: 'var(--gray-11)', marginBottom: 8 }}>Pulsing circle and a small dot orbiting smoothly.</p>
      <SVGWorkbench id="svg-test-2" initialCode={anim} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 460, name: 'svg-anim' }} />
    </div>
  )
}
