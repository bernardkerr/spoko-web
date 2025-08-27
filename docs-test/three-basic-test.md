---
title: Three.js Basic Test
description: Interactive Three.js examples embedded in Markdown using the Three Workbench.
---

# Three.js Basic Test

This page demonstrates embedding interactive Three.js scenes via MDX code fences.

## Spinning cube (default)

```three
// Return props for the ThreeCanvas
return {
  spinning: true,
  wireframe: false,
  showBackground: true,
  geometry: 'torusKnot',
}
```

## Wireframe, no background

```three
return {
  spinning: false,
  wireframe: true,
  showBackground: false,
  geometry: 'icosahedron',
}
```

## Time-aware behavior (day/night)

```js three { name="day-night-demo" }
// Compute props dynamically
const hour = new Date().getHours()
const night = hour >= 20 || hour < 6
return {
  spinning: !night,
  wireframe: night,
  showBackground: true,
  geometry: night ? 'icosahedron' : 'torusKnot',
}
```

## Manual run (autoRun=false)

```js three { autoRun=false, name="manual-run" }
// This example won't run until you click the Run button in the toolbar
const t = Date.now()
const fast = (t % 2000) < 1000
return {
  spinning: fast,
  wireframe: !fast,
  showBackground: true,
  geometry: 'icosahedron',
}
```

## Taller viewer (no editor by default)

```three { viewerHeight=440, name="taller-viewer" }
return {
  spinning: true,
  wireframe: false,
  showBackground: true,
  geometry: 'torusKnot',
}
```
