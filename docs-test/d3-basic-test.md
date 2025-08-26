# D3 Basic Test

This page demonstrates using D3 + ElkJS code blocks inside pure Markdown, rendered via the D3 Workbench.

Notes:
- The workbench unwraps the code block and renders a responsive SVG.
- You have access to `d3`, `ELK` (class), `elk` (instance), and the container `el` with `width`/`height`.
- Return a cleanup function to tear down animations if needed.

## Example A: Animated Bars (Workbench)

```js d3 {"name":"Animated Bars","workbench": true, "viewerHeight": 380}
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

```js d3 {"name":"Expandable Node","workbench": true, "viewerHeight": 300}
const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

const g = svg.append('g')

const nodeW = 160
const nodeH = 90
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
  .attr('r', 8)
  .attr('fill', 'var(--accent-9)')

parent.append('text')
  .attr('x', 40)
  .attr('y', 50)
  .attr('fill', 'var(--gray-12)')
  .attr('font-family', 'ui-sans-serif, system-ui, -apple-system')
  .attr('font-size', 14)
  .text('Composite Object')

// Children layout
const children = [
  { id: 'A', mode: 'car' },
  { id: 'B' },
  { id: 'C' },
  { id: 'D' },
]
const childSize = 56
const gap = 12

const childrenY = rootY + nodeH + 24
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

  // Icon group and renderer: car for A (toggleable), generic block for others
  function paintIcon(icon, d) {
    icon.selectAll('*').remove()
    if (d.id === 'A') {
      if (d.mode === 'banana') {
        // Banana
        icon.append('path')
          .attr('d', 'M14,28 C20,18 36,18 42,30 C36,42 20,42 14,32 Z')
          .attr('fill', 'var(--yellow-9, #f5d90a)')
          .attr('stroke', 'var(--yellow-11, #946300)')
          .attr('stroke-width', 1)
        icon.append('circle').attr('cx', 16).attr('cy', 29).attr('r', 1.6).attr('fill', 'var(--yellow-11, #946300)')
        icon.append('circle').attr('cx', 40).attr('cy', 33).attr('r', 1.6).attr('fill', 'var(--yellow-11, #946300)')
      } else {
        // Car
        icon.append('rect')
          .attr('x', 8)
          .attr('y', 26)
          .attr('width', 40)
          .attr('height', 16)
          .attr('rx', 3)
          .attr('fill', 'var(--accent-9)')
        icon.append('path')
          .attr('d', 'M14,26 L22,18 H34 L42,26 Z')
          .attr('fill', 'var(--accent-9)')
        icon.append('circle').attr('cx', 18).attr('cy', 46).attr('r', 5).attr('fill', 'var(--gray-11)')
        icon.append('circle').attr('cx', 42).attr('cy', 46).attr('r', 5).attr('fill', 'var(--gray-11)')
        icon.append('circle').attr('cx', 18).attr('cy', 46).attr('r', 2.2).attr('fill', 'white')
        icon.append('circle').attr('cx', 42).attr('cy', 46).attr('r', 2.2).attr('fill', 'white')
      }
    } else {
      icon.append('path')
        .attr('d', `M10,22 h36 v12 h-36 Z`)
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
      // Click to toggle only for A
      g.on('click', (event) => {
        if (d.id !== 'A') return
        // Prevent parent click handlers from firing
        event.stopPropagation()
        const icon = d3.select(event.currentTarget).select('.icon')
        icon.transition().duration(120).attr('opacity', 0).on('end', () => {
          d.mode = d.mode === 'banana' ? 'car' : 'banana'
          paintIcon(icon, d)
          icon.attr('opacity', 0).transition().duration(180).attr('opacity', 1)
        })
      })
    })

  enter.append('text')
    .attr('x', childSize/2)
    .attr('y', childSize - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--gray-11)')
    .attr('font-size', 12)
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

```js d3 {"name":"Force Graph","workbench": true, "viewerHeight": 420}
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

