import React from 'react'
import { ProcessingWorkbench } from '@/components/processing/ProcessingWorkbench'

export const metadata = {
  title: 'Processing Examples',
  description: 'Curated Processing.js sketches rendered as live workbenches',
}

export default function ProcessingExamplesPage() {
  const exampleA = `// Example A: Bouncing Ball\nfunction sketch(p){\n  let x, y, vx, vy, r\n  p.setup = function(){\n    p.size(width, height)\n    r = 18\n    x = width * 0.3; y = height * 0.3\n    vx = 3.2; vy = 2.1\n  }\n  p.draw = function(){\n    p.fill(255,255,255,24); p.noStroke(); p.rect(0,0,width,height)\n    x += vx; y += vy\n    if (x < r || x > width - r) vx *= -1\n    if (y < r || y > height - r) vy *= -1\n    p.noStroke(); p.fill(16,122,255)\n    p.ellipse(x, y, r*2, r*2)\n  }\n}\nreturn sketch\n`

  const exampleB = `// Example B: Orbiting Dots\nfunction sketch(p){\n  p.setup = function(){ p.size(width, height) }\n  p.draw = function(){\n    p.fill(255,255,255,20); p.noStroke(); p.rect(0,0,width,height)\n    const cx = width/2, cy = height/2\n    for (let i=0;i<18;i++){\n      const t = (p.frameCount*0.02) + i*0.35\n      const r = 40 + (i*10)\n      const x = cx + Math.cos(t) * r\n      const y = cy + Math.sin(t) * r\n      p.noStroke(); p.fill(0,0,0,180)\n      p.ellipse(x, y, 3, 3)\n    }\n  }\n}\nreturn sketch\n`

  const particles = `// Particles: A small wandering particle field\nfunction sketch(p){\n  const N = 160\n  let pts = []\n  p.setup = function(){\n    p.size(width, height)\n    for (let i=0;i<N;i++) pts.push({ x: Math.random()*width, y: Math.random()*height, a: Math.random()*Math.PI*2 })\n  }\n  p.draw = function(){\n    p.fill(255, 255, 255, 18); p.noStroke(); p.rect(0,0,width,height)\n    p.noStroke(); p.fill(0, 0, 0, 180)\n    for (const pt of pts){\n      pt.a += 0.03\n      pt.x += Math.cos(pt.a)*1.2\n      pt.y += Math.sin(pt.a)*1.2\n      if (pt.x < 0) pt.x += width; if (pt.x > width) pt.x -= width\n      if (pt.y < 0) pt.y += height; if (pt.y > height) pt.y -= height\n      p.ellipse(pt.x, pt.y, 2, 2)\n    }\n  }\n}\nreturn sketch\n`

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Processing.js Examples</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        A set of small sketches showing common patterns. Edit the code and click Run to re-execute.
      </p>
      <ProcessingWorkbench id="processing-ex-1" initialCode={exampleA} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 440 }} />
      <div style={{ height: 24 }} />
      <h2 style={{ margin: '8px 0' }}>Orbiting Dots</h2>
      <p style={{ color: 'var(--gray-11)', marginBottom: 8 }}>Multiple orbits with subtle trails using alpha fills.</p>
      <ProcessingWorkbench id="processing-ex-2" initialCode={exampleB} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 440 }} />
      <div style={{ height: 24 }} />
      <h2 style={{ margin: '8px 0' }}>Particles</h2>
      <p style={{ color: 'var(--gray-11)', marginBottom: 8 }}>A small wandering particle field.</p>
      <ProcessingWorkbench id="processing-ex-3" initialCode={particles} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 440, name: 'processing-particles' }} />
    </div>
  )
}
