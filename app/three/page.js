'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import {
  Section,
  Box,
  Tabs,
  Card,
  Button,
  Heading,
  Text,
} from '@radix-ui/themes'

export default function ThreePage() {
  const [spinning, setSpinning] = useState(false)
  const [wireframe, setWireframe] = useState(false)
  const [showBackground, setShowBackground] = useState(true)

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Three.js Examples</Heading>
          <Text as="p" color="gray" size="4">Interactive 3D graphics powered by Three.js and React Three Fiber.</Text>
        </Box>

        <Tabs.Root defaultValue="embedded">
          <Tabs.List>
            <Tabs.Trigger value="embedded">Embedded Viewer</Tabs.Trigger>
            <Tabs.Trigger value="fullscreen">
              <Button asChild variant="soft">
                <NextLink href="/three/full">Full Screen</NextLink>
              </Button>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="embedded">
            <Card>
              <Box p="4">
                <Heading size="4" mb="2">Interactive 3D Cube</Heading>
                <Text color="gray" size="2" mb="3">Use the controls below to modify the 3D scene. Click and drag to rotate the view.</Text>
                <Box mb="3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Button onClick={() => setSpinning(!spinning)}>
                    {spinning ? 'Stop Spinning' : 'Start Spinning'}
                  </Button>
                  <Button onClick={() => setWireframe(!wireframe)}>
                    {wireframe ? 'Solid' : 'Wireframe'}
                  </Button>
                  <Button onClick={() => setShowBackground(!showBackground)}>
                    {showBackground ? 'Hide Background' : 'Show Background'}
                  </Button>
                </Box>
                <Box style={{ height: 384, width: '100%', borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden' }}>
                  <ThreeCanvas
                    spinning={spinning}
                    wireframe={wireframe}
                    showBackground={showBackground}
                  />
                </Box>
              </Box>
            </Card>
          </Tabs.Content>
        </Tabs.Root>

        <Box mt="6">
          <div style={{ maxWidth: 'none' }}>
            <h2>About This Demo</h2>
            <p>
              This Three.js integration demonstrates how to embed interactive 3D content 
              in a static Next.js site. The scene includes:
            </p>
            <ul>
              <li>A rotating cube with customizable materials</li>
              <li>Orbit controls for camera manipulation</li>
              <li>Dynamic lighting and background options</li>
              <li>Responsive design that works on all devices</li>
            </ul>
            <p>
              The implementation uses React Three Fiber for declarative 3D programming 
              and @react-three/drei for additional utilities and controls.
            </p>
          </div>
        </Box>
      </Box>
    </Section>
  )
}
