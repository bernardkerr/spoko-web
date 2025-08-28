---
title: Three.js Basic Test
description: Interactive Three.js examples embedded in Markdown using the Three Workbench.
---

# Three.js Basic Test

This page demonstrates embedding interactive Three.js scenes via MDX code fences. You can return simple props (legacy) or a full program lifecycle (setup/update/dispose).


## Program mode: create full content

```js three { name="program-mode-demo", viewerHeight=380 }
// Return a lifecycle object to build a custom scene.
return {
  async setup({ THREE, add, materials, themeColors }) {
    const group = new THREE.Group()
    const torus = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.0, 0.3, 150, 16),
      materials.standard({ color: themeColors.accent, roughness: 0.35, metalness: 0.2 })
    )
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 16),
      materials.basic({ color: '#ffffff' })
    )
    sphere.position.set(2, 0.5, 0)
    group.add(torus)
    group.add(sphere)
    add(group)
    this.group = group
    this.torus = torus
    this.sphere = sphere
  },
  update({ dt }) {
    if (this.group) this.group.rotation.y += dt * 0.8
  },
  onPointerMove(e, { THREE }) {
    if (!this.sphere) return
    const t = (performance.now() % 2000) / 2000
    this.sphere.position.y = Math.sin(t * Math.PI * 2) * 0.6
  },
  onPointerDown() {
    if (this.torus) this.torus.material.wireframe = !this.torus.material.wireframe
  },
  dispose({ remove }) {
    if (!this.group) return
    remove(this.group)
    this.torus.geometry.dispose(); this.torus.material.dispose()
    this.sphere.geometry.dispose(); this.sphere.material.dispose()
    this.group = this.torus = this.sphere = null
  },
}
```

## Program mode: point cloud (animated noise)

```js three { name="point-cloud", viewerHeight=380 }
// Renders an animated point cloud using BufferGeometry and updates vertex positions over time.
return {
  async setup({ THREE, add, materials, themeColors }) {
    const count = 5000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      positions[ix + 0] = (Math.random() - 0.5) * 10
      positions[ix + 1] = (Math.random() - 0.5) * 10
      positions[ix + 2] = (Math.random() - 0.5) * 10
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x000000, vertexColors: false })
    const pts = new THREE.Points(geo, mat)
    add(pts)
    this.points = pts
    // Store base (home) positions for a gentle spring-back force
    this.base = positions.slice()
    this.t = 0
  },
  update({ dt }) {
    this.t += dt
    const geo = this.points.geometry
    const pos = geo.getAttribute('position')
    const base = this.base
    const spring = 0.02 // gentle spring factor towards base
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i)
      let y = pos.getY(i)
      let z = pos.getZ(i)

      // gentle spring toward original base position to keep points in view
      const bi = i * 3
      const bx = base[bi + 0]
      const by = base[bi + 1]
      const bz = base[bi + 2]
      x += (bx - x) * spring
      y += (by - y) * spring
      z += (bz - z) * spring

      // ripple noise around current radius
      const r = Math.sqrt(x*x + y*y + z*z)
      const off = Math.sin(r * 1.2 - this.t * 2.0) * 0.03
      x += off * (x / (r + 0.0001))
      y += off * (y / (r + 0.0001))
      z += off * (z / (r + 0.0001))

      pos.setXYZ(i, x, y, z)
    }
    pos.needsUpdate = true
  },
  dispose({ remove }) {
    if (!this.points) return
    remove(this.points)
    this.points.geometry.dispose()
    this.points.material.dispose()
    this.points = null
  }
}
```

## Program mode: split/merge object on click

```js three { name="split-merge", viewerHeight=380 }
// Click to explode the object into clustered pieces; click again to merge back.
return {
  async setup({ THREE, add, materials, themeColors }) {
    // base geometry
    const baseGeo = new THREE.IcosahedronGeometry(1.2, 1)
    const mat = materials.standard({ color: themeColors.accent, roughness: 0.35, metalness: 0.2 })

    const group = new THREE.Group()
    add(group)
    this.group = group

    // create N clones with random offsets for the exploded state
    const N = 24
    this.parts = []
    for (let i = 0; i < N; i++) {
      const mesh = new THREE.Mesh(baseGeo, mat.clone())
      mesh.userData.home = new THREE.Vector3(0, 0, 0)
      // random explode target
      const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize()
      const dist = 1.0 + Math.random() * 2.0
      mesh.userData.exploded = dir.multiplyScalar(dist)
      mesh.position.copy(mesh.userData.home)
      group.add(mesh)
      this.parts.push(mesh)
    }

    this.exploded = false
    this.animT = 0
  },
  onPointerDown() {
    // toggle state and reset animation timer
    this.exploded = !this.exploded
    this.animT = 0
  },
  update({ dt }) {
    if (!this.parts) return
    // animate between states with smoothstep
    this.animT = Math.min(1, this.animT + dt * 1.5)
    const t = this.animT
    const s = t * t * (3 - 2 * t)
    for (const m of this.parts) {
      const a = m.userData.home
      const b = m.userData.exploded
      const target = this.exploded ? b : a
      // lerp from current to target for a softer feel
      m.position.lerp(target, 0.15)
      m.rotation.x += dt * 0.6
      m.rotation.y += dt * 0.4
    }
  },
  dispose({ remove }) {
    if (!this.group) return
    for (const m of this.parts || []) { m.geometry.dispose(); m.material.dispose() }
    remove(this.group)
    this.group = null
    this.parts = null
  }
}
