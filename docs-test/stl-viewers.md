---
title: STL Viewer Embeds
description: Demonstrates embedding the lightweight STL viewer inside markdown using MDX components.
---

## Simple STL Viewer

<STLViewer src="CrudeFrame.stl" height={260} expandedHeight={480} name="CrudeFrame" toolsEnabled={true} />

## Small Viewer With Wrapped Text

<div style={{ display: 'flow-root' }}>
  {/* Float the viewer to the right so text wraps around it */}
  <div style={{ float: 'right', width: 220, margin: '0 0 12px 16px' }}>
    <STLViewer
      src="CrudeFrame.stl"
      height={180}
      expandedHeight={320}
      name="CrudeFrame-compact"
    />
  </div>

  Modern robotics teams iterate rapidly on chassis and actuator designs, and having an
  embedded STL preview beside the documentation helps reviewers reason about clearances
  and mounting points without context switching. The compact viewer loads quickly,
  supports responsive orbit controls, and respects the site theme for visual consistency.

  CAD models often evolve across sprints, so keeping lightweight assets in docs reduces
  friction for non-CAD contributors. Authors can link to the heavier STEP sources when
  needed while using the STL for fast page loads. The inline viewer also makes it easy
  to call out specific assembly steps or tolerance considerations directly in the text.
</div>

## Heavy Model

<STLViewer src="SirayaTechTestModel2021.stl" height={260} expandedHeight={520} name="SirayaTechTestModel2021" />

## Customized View Defaults

<STLViewer
  src="CrudeFrame.stl"
  height={260}
  expandedHeight={520}
  name="GrayStudioGrid"
  spinMode="on"
  frameMode="LIGHT"
  shadingMode="WHITE"
  styleMode="STUDIO"
  backgroundMode="GRID"
  edgesMode="BLACK"
  outlineColorMode="AUTO"
  edgesLineWidth={2.5}
  ambientLevel={1.5}
  directionalLevel={2.5}
/>
