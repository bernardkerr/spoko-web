'use client'

import NextLink from 'next/link'
import { Box, Button } from '@radix-ui/themes'
import { ThreeWorkbench } from '@/components/three/ThreeWorkbench'

export default function ThreeFullPage() {
  const initialCode = `// Fullscreen Three Workbench\n// Return props to configure the scene.\nreturn {\n  spinning: true,\n  wireframe: false,\n  showBackground: true,\n}`

  return (
    <Box style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Back overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'var(--color-panel-translucent)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: 16,
          border: '1px solid var(--gray-a6)',
        }}
      >
        <Button asChild variant="soft" size="2">
          <NextLink href="/test/three">Back</NextLink>
        </Button>
      </Box>

      {/* Full-screen workbench viewer */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ThreeWorkbench
          id="three-full"
          initialCode={initialCode}
          autoRun={true}
          showEditorDefault={false}
          ui={{ workbench: true, viewerHeight: 720 }}
        />
      </div>
    </Box>
  )
}
