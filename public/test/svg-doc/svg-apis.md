# SVG APIs

Below is a compact reference table for commonly used SVG.js utilities in this project. Edit this file to add or refine entries.

| Name | Description | Signature | Docs |
|------|-------------|-----------|------|
| SVG | Creates a new SVG.js root/context. Often followed by addTo, size, and viewbox. | SVG() | https://svgjs.dev/docs/3.2/containers/#root |
| draw.addTo | Appends the drawing to a container element. | draw.addTo(el) | https://svgjs.dev/docs/3.2/containers/#add-elements-to-the-dom |
| draw.size | Sets width and height of the SVG. | draw.size(width, height) | https://svgjs.dev/docs/3.2/containers/#size |
| draw.viewbox | Sets the SVG viewBox for responsive scaling. | draw.viewbox(x, y, width, height) | https://svgjs.dev/docs/3.2/containers/#viewbox |
| draw.group | Creates a group to organize elements. | const g = draw.group() | https://svgjs.dev/docs/3.2/containers/#group |
| draw.rect | Draws a rectangle. Chain move/fill/stroke/rx. | draw.rect(w, h) | https://svgjs.dev/docs/3.2/shape-elements/#rect |
| draw.circle | Draws a circle by diameter; use radius() to animate radius. | draw.circle(diameter) | https://svgjs.dev/docs/3.2/shape-elements/#circle |
| draw.line | Draws a line segment between two points. | draw.line(x1, y1, x2, y2) | https://svgjs.dev/docs/3.2/shape-elements/#line |
| draw.polygon | Draws a polygon from point list. | draw.polygon('x1,y1 x2,y2 ...') | https://svgjs.dev/docs/3.2/shape-elements/#polygon |
| draw.text | Creates a text element; chain font and move/center. | draw.text(str) | https://svgjs.dev/docs/3.2/text/#text |
| el.move | Positions an element by its top-left. | el.move(x, y) | https://svgjs.dev/docs/3.2/geom/#move |
| el.center | Centers an element around a point. | el.center(cx, cy) | https://svgjs.dev/docs/3.2/geom/#center |
| el.size | Sets element width/height. | el.size(w, h) | https://svgjs.dev/docs/3.2/geom/#size |
| el.fill | Sets fill color (supports CSS vars). | el.fill(colorOrAttrs) | https://svgjs.dev/docs/3.2/fill-and-stroke/#fill |
| el.stroke | Sets stroke properties. | el.stroke({ color, width, linecap, linejoin }) | https://svgjs.dev/docs/3.2/fill-and-stroke/#stroke |
| el.animate | Starts an animation; chain attribute/geom setters. | el.animate(ms, delay, when) | https://svgjs.dev/docs/3.2/animating/#basic-usage |
| anim.after | Callback after animation completes (useful for loops). | anim.after(fn) | https://svgjs.dev/docs/3.2/animating/#callbacks |
| el.attr | Get/set attributes generically. | el.attr(name, value) | https://svgjs.dev/docs/3.2/methods/#attr |
