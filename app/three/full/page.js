'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import { getAssetPath } from '@/lib/paths'
import { Box, Button, Heading, Text } from '@radix-ui/themes'

export default function ThreeFullPage() {
  const [spinning, setSpinning] = useState(true)
  const [wireframe, setWireframe] = useState(false)

  return (
    <Box style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Controls overlay */}
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
          <NextLink href={getAssetPath('/three')}>Back</NextLink>
        </Button>
        <Button size="2" onClick={() => setSpinning(!spinning)}>
          {spinning ? 'Stop' : 'Spin'}
        </Button>
        <Button size="2" onClick={() => setWireframe(!wireframe)}>
          {wireframe ? 'Solid' : 'Wire'}
        </Button>
      </Box>

      {/* Full-screen canvas */}
      <ThreeCanvas
        spinning={spinning}
        wireframe={wireframe}
        showBackground={true}
        fullscreen={true}
      />
    </Box>
  )
}
