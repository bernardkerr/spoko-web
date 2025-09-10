import React from 'react'
import STLViewer from '@/components/stl/STLViewer'

export const metadata = {
  title: 'STL Viewer (Test)',
  description: 'Lightweight STL viewer with view tools and download.',
}

export default function STLViewerTestPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>STL Viewer (Test)</h1>
      <p style={{ color: 'var(--gray-11)', marginBottom: 16 }}>
        A minimal Three.js STL viewer. Click the wrench to open tools, then use View to toggle
        view controls and Download to save the STL file. Respects light/dark theme.
      </p>

      <STLViewer id="stl-demo-1" src="CrudeFrame.stl" height={300} expandedHeight={520} name="CrudeFrame" toolsEnabled={true} />

      <div style={{ height: 24 }} />

      <h2 style={{ margin: '8px 0' }}>Larger model</h2>
      <p style={{ color: 'var(--gray-11)', marginBottom: 8 }}>Heavy triangle count sample for stress testing.</p>
      <STLViewer id="stl-demo-2" src="SirayaTechTestModel2021.stl" height={300} expandedHeight={520} name="SirayaTechTestModel2021" toolsEnabled={true} />
    </div>
  )
}
