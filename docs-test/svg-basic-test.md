# SVG.js Basic Test

This page embeds interactive SVG.js examples using fenced code blocks. The workbench opens to show an editor and live preview.

- Colors use Radix theme variables like `var(--accent-9)` and `var(--gray-11)`.
- Export the SVG using the toolbar.

```svg { "workbench": true, "viewerHeight": 420 }
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

```js svg { "name": "svg-anim", "workbench": true, "viewerHeight": 420 }
// Animation demo
const draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)
const rect = draw.rect(40, 40).center(width/2, height/2).fill('var(--accent-9)')
function spin(){ rect.animate(1200).rotate(180).ease('<>').animate(1200).rotate(360).ease('<>').after(spin) }
spin()
```
