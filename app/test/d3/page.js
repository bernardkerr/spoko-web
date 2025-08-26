import React from 'react'
import { D3Workbench } from '@/components/d3/D3Workbench'

export const metadata = {
  title: 'D3 Workbench Test',
  description: 'Interactive D3 + ElkJS editor and live preview',
}

export default function D3TestPage() {
  const sample = `// Example: animated nodes laid out by ELK
const svg = d3.select(el).append('svg')
  .attr('viewBox', [0,0,width,height])
  .style('display','block')
  .style('width','100%')
  .style('height','100%')

// A tiny graph for layout
const graph = {
  id: 'root',
  layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' },
  children: [
    { id: 'n1', width: 80, height: 40, labels: [{ text: 'A' }] },
    { id: 'n2', width: 80, height: 40, labels: [{ text: 'B' }] },
    { id: 'n3', width: 80, height: 40, labels: [{ text: 'C' }] },
  ],
  edges: [
    { id: 'e1', sources: ['n1'], targets: ['n2'] },
    { id: 'e2', sources: ['n2'], targets: ['n3'] },
  ],
}

const layout = await elk.layout(graph)

const g = svg.append('g')
  .attr('transform', 'translate(20,20)')

// draw edges as simple lines between port centers
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

const nodes = g.selectAll('rect')
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

// labels
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
`

  const forceSample = `// Force-directed graph with drag + Add Node button
// Elements available: el, d3, width, height

// Simple toolbar
const ui = d3.select(el)
  .append('div')
  .style('display', 'flex')
  .style('gap', '8px')
  .style('alignItems', 'center')
  .style('marginBottom', '8px')

ui.append('span').text('Force Graph: drag nodes; click to add')
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
const nodes = [
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
]
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
  .force('link', d3.forceLink(links).id(function(d){ return d.id }).distance(60))
  .force('charge', d3.forceManyBody().strength(-160))
  .force('center', d3.forceCenter(width/2, height/2))
  .on('tick', ticked)

function update() {
  // JOIN
  const l = link.data(links)
  l.join('line')

  const n = node.data(nodes, function(d){ return d.id })
  n.join(
    function(enter){
      return enter.append('circle')
        .attr('r', 8)
        .attr('fill', 'var(--accent-9)')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
        )
    },
    function(update){ return update },
    function(exit){ exit.remove() }
  )

  simulation.nodes(nodes)
  simulation.force('link').links(links)
  simulation.alpha(1).restart()
}

function ticked() {
  g.selectAll('line')
    .attr('x1', function(d){ return d.source.x })
    .attr('y1', function(d){ return d.source.y })
    .attr('x2', function(d){ return d.target.x })
    .attr('y2', function(d){ return d.target.y })

  g.selectAll('circle')
    .attr('cx', function(d){ return d.x })
    .attr('cy', function(d){ return d.y })
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

addBtn.on('click', function(){
  const n = { id: nextId++, x: width/2 + (Math.random()-0.5)*40, y: height/2 + (Math.random()-0.5)*40 }
  nodes.push(n)
  const L = nearestLinkFor(n)
  if (L) links.push(L)
  update()
})

update()

// Cleanup: stop simulation and remove any timers/listeners if needed
return function(){ simulation.stop() }
`

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>D3 Workbench (Test)</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        Live-edit D3 code and render to responsive SVG. ElkJS is available as <code>ELK</code> and <code>elk</code>.
      </p>
      <D3Workbench id="d3-test-1" initialCode={sample} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 460 }} />
      <div style={{ height: 24 }} />
      <h2 style={{ margin: '8px 0' }}>Force-directed Graph</h2>
      <p style={{ color: 'var(--gray-11)', marginBottom: 8 }}>Drag nodes to reposition. Use the button to add nodes; new nodes connect to their nearest neighbor.</p>
      <D3Workbench id="d3-test-2" initialCode={forceSample} autoRun={true} showEditorDefault={true} ui={{ viewerHeight: 460, name: 'force-graph' }} />
    </div>
  )
}
