# D3 Basic Test

This page demonstrates using D3 + ElkJS code blocks inside pure Markdown, rendered via the D3 Workbench.

Notes:
- The workbench unwraps the code block and renders a responsive SVG.
- You have access to `d3`, `ELK` (class), `elk` (instance), and the container `el` with `width`/`height`.
- Return a cleanup function to tear down animations if needed.

## Example A: Animated Bars (Workbench)

```js d3 {"name":"Animated Bars","workbench": false, "viewerHeight": 380}
const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

const data = [4, 8, 15, 16, 23, 42];
const x = d3.scaleBand().domain(d3.range(data.length)).range([40, width-20]).padding(0.2);
const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height-40, 20]);

svg.append('g')
  .attr('transform', `translate(0,${height-40})`)
  .call(d3.axisBottom(x).tickFormat(i => i+1).tickSizeOuter(0))

svg.append('g')
  .attr('transform', `translate(40,0)`) 
  .call(d3.axisLeft(y).ticks(5))

const bars = svg.selectAll('rect').data(data).join('rect')
  .attr('x', (_, i) => x(i))
  .attr('width', x.bandwidth())
  .attr('y', height-40)
  .attr('height', 0)
  .attr('fill', 'var(--accent-9)')

bars.transition().duration(900)
  .attr('y', d => y(d))
  .attr('height', d => (height-40) - y(d))
```

## Example B: ElkJS Layout + Animation

```js d3 {"name":"ELK Layout","viewerHeight": 420}
const graph = {
  id: 'root',
  layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' },
  children: [
    { id: 'n1', width: 90, height: 36, labels: [{ text: 'Start' }] },
    { id: 'n2', width: 90, height: 36, labels: [{ text: 'Work' }] },
    { id: 'n3', width: 90, height: 36, labels: [{ text: 'End' }] },
  ],
  edges: [
    { id: 'e1', sources: ['n1'], targets: ['n2'] },
    { id: 'e2', sources: ['n2'], targets: ['n3'] },
  ],
}

const layout = await elk.layout(graph)

const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

const g = svg.append('g').attr('transform', 'translate(20,20)')

for (const e of layout.edges || []) {
  const s = layout.children.find(c => c.id === e.sources[0])
  const t = layout.children.find(c => c.id === e.targets[0])
  if (!s || !t) continue
  const x1 = s.x + s.width
  const y1 = s.y + s.height/2
  const x2 = t.x
  const y2 = t.y + t.height/2
  g.append('line')
    .attr('x1', x1).attr('y1', y1)
    .attr('x2', x1).attr('y2', y1)
    .attr('stroke', 'var(--gray-11)')
    .attr('stroke-width', 2)
    .transition().duration(700)
    .attr('x2', x2).attr('y2', y2)
}

g.selectAll('rect')
  .data(layout.children)
  .join('rect')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.width)
    .attr('height', d => d.height)
    .attr('rx', 8)
    .attr('fill', 'var(--accent-9)')
    .attr('opacity', 0)
  .transition().duration(600)
    .attr('opacity', 1)

g.selectAll('text')
  .data(layout.children)
  .join('text')
    .attr('x', d => d.x + d.width/2)
    .attr('y', d => d.y + d.height/2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-family', 'ui-sans-serif, system-ui, -apple-system')
    .attr('fill', 'white')
    .text(d => (d.labels && d.labels[0] && d.labels[0].text) || d.id)
```

## Example C: Cleanup Function (Optional)

```js d3 {"name":"Animated Dot with Cleanup","viewerHeight": 200}
const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

const dot = svg.append('circle')
  .attr('cx', 20)
  .attr('cy', height/2)
  .attr('r', 8)
  .attr('fill', 'var(--accent-9)')

let running = true
;(async function loop() {
  while (running) {
    await dot.transition().duration(800).attr('cx', width-20).end()
    await dot.transition().duration(800).attr('cx', 20).end()
  }
})()

// Return a cleanup to stop the loop when re-running or unmounting
return () => { running = false }
```

## Example D: Expandable SVG Node

```js d3 {"name":"Expandable Node","workbench": false, "viewerHeight": 340}
const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

const g = svg.append('g')

const nodeW = 200
const nodeH = 110
const rootX = (width - nodeW)/2
const rootY = 20

let selected = false

// Selection background behind the parent node
const selBg = g.append('rect')
  .attr('x', rootX - 12)
  .attr('y', rootY - 12)
  .attr('width', nodeW + 24)
  .attr('height', nodeH + 24)
  .attr('rx', 12)
  .attr('fill', 'var(--gray-a2)')
  .attr('stroke', 'var(--gray-a5)')

// Parent node group (a simple object)
const parent = g.append('g').attr('transform', `translate(${rootX},${rootY})`).style('cursor','pointer')

// Body
parent.append('rect')
  .attr('width', nodeW)
  .attr('height', nodeH)
  .attr('rx', 10)
  .attr('fill', 'white')
  .attr('stroke', 'var(--gray-8)')

// Top bar accent
parent.append('rect')
  .attr('width', nodeW)
  .attr('height', 18)
  .attr('rx', 10)
  .attr('fill', 'var(--accent-9)')

// Icon and label
parent.append('circle')
  .attr('cx', 20)
  .attr('cy', 46)
  .attr('r', 10)
  .attr('fill', 'var(--accent-9)')

parent.append('text')
  .attr('x', 40)
  .attr('y', 50)
  .attr('fill', 'var(--gray-12)')
  .attr('font-family', 'ui-sans-serif, system-ui, -apple-system')
  .attr('font-size', 16)
  .text('Composite Object')

// Children layout
const children = [
  { id: 'A', mode: 'car' },
  { id: 'B' },
  { id: 'C' },
  { id: 'D' },
]
const childSize = 72
const gap = 16

const childrenY = rootY + nodeH + 28
function childX(i, n) {
  const totalW = n*childSize + (n-1)*gap
  return (width - totalW)/2 + i*(childSize + gap)
}

const childLayer = g.append('g')

// Render children (hidden by default)
function renderChildren() {
  const sel = childLayer.selectAll('g.child').data(selected ? children : [], d => d.id)
  const enter = sel.enter().append('g')
    .attr('class','child')
    .attr('transform', (d,i) => `translate(${childX(i, children.length)},${childrenY})`)
    .attr('opacity', 0)

  enter.append('rect')
    .attr('width', childSize)
    .attr('height', childSize)
    .attr('rx', 8)
    .attr('fill', 'white')
    .attr('stroke', 'var(--gray-7)')

  // Icon renderer with shape morph using path-length sampling (Observable technique)
  // Helpers
  function pathFromPoints(pts) {
    return 'M' + pts.map(p => `${p[0]},${p[1]}`).join(' L ') + ' Z'
  }
  function samplePathPoints(d, N = 160) {
    const temp = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    temp.setAttribute('d', d)
    const L = temp.getTotalLength()
    const pts = []
    for (let i = 0; i < N; i++) {
      const p = temp.getPointAtLength((i/(N-1)) * L)
      pts.push([p.x, p.y])
    }
    return pts
  }

  const CAR_PATH = 'M10,46 L50,46 L50,28 L42,26 L34,18 L22,18 L14,26 L10,28 Z'
  // Parametric banana crescent generator (returns a path string)
  // cx, cy: center; rx, ry: outer radii; t: thickness; tip: small cap length; bend: curvature factor (0..1)
  function bananaPath({cx=36, cy=36, rx=28, ry=18, t=7, tip=4, bend=0.5}={}) {
    // Clamp bend to sane range
    bend = Math.max(0.1, Math.min(0.9, bend))
    // Outer arc start/end
    const sx = cx - rx * 0.95
    const sy = cy + ry * 1.05
    const ex = cx + rx * 0.95
    const ey = cy - ry * bend
    // Inner radii (thinner inner arc)
    const rx2 = Math.max(4, rx - t)
    const ry2 = Math.max(3, ry - t * 0.9)
    // Inner start near base
    const isx = cx - rx2 * 0.78
    const isy = cy + ry2 * 0.58
    // Path: outer arc -> tip cap -> inner arc back -> base cap
    const outer = `M${sx.toFixed(1)},${sy.toFixed(1)} A${rx.toFixed(1)},${ry.toFixed(1)} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`
    const capTip = ` Q${(ex+tip).toFixed(1)},${(ey+1).toFixed(1)} ${ex.toFixed(1)},${(ey+tip).toFixed(1)}`
    const inner = ` A${rx2.toFixed(1)},${ry2.toFixed(1)} 0 0 0 ${isx.toFixed(1)},${isy.toFixed(1)}`
    const capBase = ` Q${(sx+2).toFixed(1)},${(sy-2).toFixed(1)} ${sx.toFixed(1)},${sy.toFixed(1)} Z`
    return outer + capTip + inner + capBase
  }

  // Tuned banana parameters for a longer, thinner, more curved crescent
  const bananaParams = {cx: 36, cy: 36, rx: 34, ry: 12, t: 6, tip: 6, bend: 0.75}

  function paintIcon(icon, d) {
    icon.selectAll('*').remove()
    if (d.id === 'A') {
      const path = icon.append('path').attr('class', 'icon-shape')
      const wheels = icon.append('g').attr('class', 'wheels')
      wheels.append('circle').attr('cx', 20).attr('cy', 50).attr('r', 6).attr('fill', 'var(--gray-11)')
      wheels.append('circle').attr('cx', 44).attr('cy', 50).attr('r', 6).attr('fill', 'var(--gray-11)')
      wheels.append('circle').attr('cx', 20).attr('cy', 50).attr('r', 2.6).attr('fill', 'white')
      wheels.append('circle').attr('cx', 44).attr('cy', 50).attr('r', 2.6).attr('fill', 'white')
      // Small stem near the tip for banana mode
      const stem = icon.append('path').attr('class', 'stem')
        .attr('d', 'M64,32 l5,2 -2,6 -5,-2 Z')
        .attr('fill', 'var(--yellow-11, #946300)')
        .attr('opacity', 0)

      const dInit = d.mode === 'banana' ? bananaPath(bananaParams) : CAR_PATH
      path
        .attr('d', dInit)
        .attr('fill', d.mode === 'banana' ? 'var(--yellow-9, #f5d90a)' : 'var(--accent-9)')
        .attr('stroke', d.mode === 'banana' ? 'var(--yellow-11, #946300)' : 'none')
        .attr('stroke-width', d.mode === 'banana' ? 1.1 : 0)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('transform', d.mode === 'banana' ? 'rotate(-20,36,36)' : null)
      // Position stem at the computed tip
      if (d.mode === 'banana') {
        const ex = bananaParams.cx + bananaParams.rx * 0.95
        const ey = bananaParams.cy - bananaParams.ry * bananaParams.bend
        stem.attr('d', `M${ex.toFixed(1)},${ey.toFixed(1)} l5,2 -2,6 -5,-2 Z`)
      }
      wheels.attr('opacity', d.mode === 'car' ? 1 : 0)
      stem.attr('opacity', d.mode === 'banana' ? 1 : 0)
    } else {
      icon.append('path')
        .attr('d', `M12,24 h40 v14 h-40 Z`)
        .attr('fill', 'var(--accent-9)')
        .attr('opacity', 0.9)
    }
  }

  enter
    .style('cursor','pointer')
    .each(function(d) {
      const g = d3.select(this)
      const icon = g.append('g').attr('class', 'icon')
      paintIcon(icon, d)
      // Click to toggle only for A with shape morph via path-length sampling
      g.on('click', (event) => {
        if (d.id !== 'A') return
        event.stopPropagation()
        const iconG = d3.select(event.currentTarget).select('.icon')
        const path = iconG.select('path.icon-shape')
        const wheels = iconG.select('.wheels')
        const stem = iconG.select('.stem')
        const fromD = path.attr('d')
        d.mode = d.mode === 'banana' ? 'car' : 'banana'
        const toD = d.mode === 'banana' ? bananaPath(bananaParams) : CAR_PATH
        const fromPts = samplePathPoints(fromD, 220)
        const toPts = samplePathPoints(toD, 220)
        const interp = d3.interpolateArray(fromPts, toPts)
        path
          .transition()
          .duration(700)
          .ease(d3.easeCubicInOut)
          .attrTween('d', () => t => pathFromPoints(interp(t)))
          .attr('fill', d.mode === 'banana' ? 'var(--yellow-9, #f5d90a)' : 'var(--accent-9)')
          .attr('stroke', d.mode === 'banana' ? 'var(--yellow-11, #946300)' : 'none')
          .attr('stroke-width', d.mode === 'banana' ? 1.1 : 0)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('transform', d.mode === 'banana' ? 'rotate(-20,36,36)' : null)
        if (d.mode === 'banana') {
          const ex = bananaParams.cx + bananaParams.rx * 0.95
          const ey = bananaParams.cy - bananaParams.ry * bananaParams.bend
          stem.transition().duration(300).attr('d', `M${ex.toFixed(1)},${ey.toFixed(1)} l5,2 -2,6 -5,-2 Z`)
        }
        wheels.transition().duration(400).ease(d3.easeCubicInOut).attr('opacity', d.mode === 'car' ? 1 : 0)
        stem.transition().duration(400).ease(d3.easeCubicInOut).attr('opacity', d.mode === 'banana' ? 1 : 0)
      })
    })

  enter.append('text')
    .attr('x', childSize/2)
    .attr('y', childSize - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--gray-11)')
    .attr('font-size', 14)
    .attr('font-family', 'ui-sans-serif, system-ui, -apple-system')
    .text(d => d.id)

  enter.transition().duration(250).attr('opacity', 1)

  sel.exit().transition().duration(200).attr('opacity', 0).remove()
}

// Selection visuals
function updateSelection() {
  selBg
    .transition().duration(150)
    .attr('fill', selected ? 'var(--accent-a3)' : 'var(--gray-a2)')
    .attr('stroke', selected ? 'var(--accent-9)' : 'var(--gray-a5)')
    .attr('stroke-width', selected ? 2 : 1)

  renderChildren()
}

// Toggle on click
parent.on('click', () => {
  selected = !selected
  updateSelection()
})

// Initial paint
updateSelection()
```

## Example E: Force-Directed Graph (Workbench)

```js d3 {"name":"Force Graph","workbench": false, "viewerHeight": 420}
// Force-directed graph with dragging and an "Add Node" button.
// Available: el, d3, width, height

// Toolbar
const ui = d3.select(el)
  .append('div')
  .style('display', 'flex')
  .style('gap', '8px')
  .style('alignItems', 'center')
  .style('marginBottom', '8px')

ui.append('span').text('Force Graph: drag nodes; click button to add')
const addBtn = ui.append('button')
  .attr('type', 'button')
  .text('Add Node')

const svg = d3.select(el).append('svg')
  .attr('viewBox', [0, 0, width, height])
  .style('display', 'block')
  .style('width', '100%')
  .style('height', '100%')

// Data
let nextId = 6
const nodes = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ]
const links = []

function nearestLinkFor(node) {
  let best = null
  let bestDist = Infinity
  for (const n of nodes) {
    if (n === node) continue
    const dx = (n.x || 0) - (node.x || 0)
    const dy = (n.y || 0) - (node.y || 0)
    const d2 = dx*dx + dy*dy
    if (d2 < bestDist) { bestDist = d2; best = n }
  }
  return best ? { source: node.id, target: best.id } : null
}

// Seed links: connect each node to its nearest neighbor
function seedLinks() {
  links.length = 0
  for (const n of nodes) {
    const L = nearestLinkFor(n)
    if (L && !links.find(e => (e.source === L.source && e.target === L.target) || (e.source === L.target && e.target === L.source))) {
      links.push(L)
    }
  }
}
seedLinks()

const g = svg.append('g')
const link = g.append('g').attr('stroke', 'var(--gray-11)').attr('stroke-width', 1.5).selectAll('line')
const node = g.append('g').selectAll('circle')

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(60))
  .force('charge', d3.forceManyBody().strength(-160))
  .force('center', d3.forceCenter(width/2, height/2))
  .on('tick', ticked)

function update() {
  // Links
  link.data(links).join('line')
  // Nodes
  node.data(nodes, d => d.id).join(
    enter => enter.append('circle')
      .attr('r', 8)
      .attr('fill', 'var(--accent-9)')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      ),
    update => update,
    exit => exit.remove()
  )

  simulation.nodes(nodes)
  simulation.force('link').links(links)
  simulation.alpha(1).restart()
}

function ticked() {
  g.selectAll('line')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

  g.selectAll('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x; d.fy = d.y
}
function dragged(event, d) {
  d.fx = event.x; d.fy = event.y
}
function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0)
  d.fx = null; d.fy = null
}

addBtn.on('click', () => {
  const n = { id: nextId++, x: width/2 + (Math.random()-0.5)*40, y: height/2 + (Math.random()-0.5)*40 }
  nodes.push(n)
  const L = nearestLinkFor(n)
  if (L) links.push(L)
  update()
})

update()

// Cleanup
return () => { simulation.stop() }
```

