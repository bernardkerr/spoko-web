# D3 APIs

Below is a compact reference table for commonly used D3 utilities in this project. Edit this file to add or refine entries.

| Name | Description | Signature | Docs |
|------|-------------|-----------|------|
| select | Selects the first element that matches the selector string. | d3.select(selector) | https://github.com/d3/d3-selection |
| selectAll | Selects all elements that match the selector string. | d3.selectAll(selector) | https://github.com/d3/d3-selection |
| scaleLinear | Constructs a linear scale for continuous numeric input and output. | d3.scaleLinear().domain([a,b]).range([x,y]) | https://github.com/d3/d3-scale |
| axisBottom | Creates a bottom-oriented axis generator for a given scale. | d3.axisBottom(scale) | https://github.com/d3/d3-axis |
| transition | Creates a transition for smooth attribute/style interpolation and timing. | d3.select(node).transition().duration(ms) | https://github.com/d3/d3-transition |
| line | Generates an SVG path string from an array of points. | d3.line().x(d => ...).y(d => ...) | https://github.com/d3/d3-shape |
