# SVG.js Basic Test

This page embeds interactive SVG.js examples using fenced code blocks. The workbench opens to show an editor and live preview.

- Colors use Radix theme variables like `var(--accent-9)` and `var(--gray-11)`.
- Export the SVG using the toolbar.

## Example A: Basic Shapes

```svg { "workbench": false }
// Basic shapes and text
const draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)

// background panel
draw.rect(width, height).fill('var(--color-panel-solid)').stroke({ width: 1, color: 'var(--gray-a6)' })

// shapes
draw.circle(80).move(24, 24).fill('var(--accent-9)')
draw.rect(120, 60).move(140, 40).fill('var(--green-9)').rx(12)
draw.ellipse(120, 60).move(280, 40).fill('var(--blue-9)')

// text
draw.text('SVG.js in MDX').move(24, 140).font({ fill: 'var(--gray-12)', size: 24, family: 'ui-sans-serif, system-ui' })
```

## Example B: Animation

```js svg { "name": "svg-anim", "workbench": false, "viewerHeight": 420 }
// Animation demo
const draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)
const rect = draw.rect(40, 40).center(width/2, height/2).fill('var(--accent-9)')
function spin(){ rect.animate(1200).rotate(180).ease('<>').animate(1200).rotate(360).ease('<>').after(spin) }
spin()
```

## Example C: Orthogonal Flow (+ Ports) with ELK.js

```js svg { "name": "elk-orthogonal", "workbench": false, "viewerHeight": 460 }
// Orthogonal layout of rectangles using ELK.js with named ports.
// Renders only 0°/90° edges. Clean, shaded rectangles with labels.
// ELK and a constructed instance 'elk' are provided by the SVG workbench.

const draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)

// Background
draw.rect(width, height)
  .fill('var(--color-panel-solid)')
  .stroke({ width: 1, color: 'var(--gray-a6)' })

// Node definitions (at least 5)
const nodeSize = { w: 160, h: 72 }
const nodes = [
  { id: 'A', label: 'Start' },
  { id: 'B', label: 'Fetch Data' },
  { id: 'C', label: 'Transform' },
  { id: 'D', label: 'Validate' },
  { id: 'E', label: 'Render' },
]

// ELK graph with named ports and orthogonal routing
const children = nodes.map(n => ({
  id: n.id,
  width: nodeSize.w,
  height: nodeSize.h,
  labels: [{ id: n.id + '_label', text: n.label }],
  ports: [
    { id: `${n.id}.N`, properties: { 'elk.port.side': 'NORTH' } },
    { id: `${n.id}.S`, properties: { 'elk.port.side': 'SOUTH' } },
    { id: `${n.id}.E`, properties: { 'elk.port.side': 'EAST' } },
    { id: `${n.id}.E2`, properties: { 'elk.port.side': 'EAST' } },
    { id: `${n.id}.W`, properties: { 'elk.port.side': 'WEST' } },
    { id: `${n.id}.W2`, properties: { 'elk.port.side': 'WEST' } },
  ],
}))

const edges = [
  { id: 'e1', sources: ['A.E'], targets: ['B.W'] },
  { id: 'e2', sources: ['A.E2'], targets: ['C.W'] },
  { id: 'e3', sources: ['B.E'], targets: ['D.W'] },
  { id: 'e4', sources: ['C.E'], targets: ['D.W2'] },
  { id: 'e5', sources: ['D.E'], targets: ['E.W'] },
]

// Track which ports are actually used by edges so we can hide unattached ones
const usedPorts = new Set()
for (const e of edges) {
  for (const s of e.sources || []) usedPorts.add(s)
  for (const t of e.targets || []) usedPorts.add(t)
}

const graph = {
  id: 'root',
  children,
  edges,
  layoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '48',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  },
}

const res = await elk.layout(graph)

// Center the result in the viewport
const gw = res.width || 800
const gh = res.height || 400
const ox = Math.max(16, (width - gw) / 2)
const oy = Math.max(16, (height - gh) / 2)
const g = draw.group().translate(ox, oy)

// Subtle rectangle style (low-saturation colored fills)
const palette = [
  'var(--blue-3)',
  'var(--green-3)',
  'var(--orange-3)',
  'var(--purple-3)',
  'var(--teal-3)'
]

function nodeRect(x, y, w, h, label, color) {
  const group = g.group()
  // base panel with subtle color
  group.rect(w, h).move(x, y)
    .fill(color || 'var(--gray-2)')
    .stroke({ width: 1, color: 'var(--gray-a6)' })
    .rx(10)
  // top shading band (slightly darker)
  group.rect(w, Math.min(18, h * 0.28)).move(x, y)
    .fill('var(--gray-a3)')
    .rx(10)
  // label (larger)
  group.text(label)
    .font({ fill: 'var(--gray-12)', size: 18, weight: 600, family: 'ui-sans-serif, system-ui' })
    .center(x + w / 2, y + h / 2 + 4)
  return group
}

// Draw nodes with per-node subtle color
const idxMap = Object.fromEntries(nodes.map((n, i) => [n.id, i]))
for (const c of res.children || []) {
  const i = idxMap[c.id] ?? 0
  nodeRect(c.x, c.y, c.width, c.height, (c.labels && c.labels[0]?.text) || c.id, palette[i % palette.length])
}

// Orthogonal edges renderer using ELK sections
function drawElkEdge(edge) {
  if (!edge || !edge.sections || !edge.sections.length) return
  const pts = []
  for (const sec of edge.sections) {
    if (sec.startPoint) pts.push([sec.startPoint.x, sec.startPoint.y])
    if (sec.bendPoints) for (const bp of sec.bendPoints) pts.push([bp.x, bp.y])
    if (sec.endPoint) pts.push([sec.endPoint.x, sec.endPoint.y])
  }
  const poly = g.polyline(pts).fill('none').stroke({ color: 'var(--gray-8)', width: 1.5 })
  return poly
}

for (const e of res.edges || []) drawElkEdge(e)

// Port labels (N,S,E,W) at ELK-computed port positions
for (const c of res.children || []) {
  if (!c.ports) continue
  for (const p of c.ports) {
    // Skip unattached ports for a cleaner look
    if (!usedPorts.has(String(p.id))) continue
    const px = (c.x || 0) + (p.x || 0)
    const py = (c.y || 0) + (p.y || 0)
    const id = String(p.id || '')
    const side = id.split('.').pop() || ''
    const lbl = side.substring(0,1)
    // offset label outwards slightly based on side to avoid overlapping border
    let ox = 0, oy = 0, anchor = 'middle'
    if (side === 'N') { oy = -8; anchor = 'middle' }
    else if (side === 'S') { oy = 12; anchor = 'middle' }
    else if (side === 'E') { ox = 10; anchor = 'start' }
    else if (side === 'W') { ox = -10; anchor = 'end' }
    g.text(lbl)
      .font({ size: 11, fill: 'var(--gray-11)', family: 'ui-sans-serif, system-ui' })
      .attr({ 'text-anchor': anchor })
      .move(px + ox, py + oy)
  }
}

// Optional: return cleanup
return () => { draw.clear() }
```
