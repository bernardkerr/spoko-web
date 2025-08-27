'use client'

import NextLink from 'next/link'
import { ThreeWorkbench } from '@/components/three/ThreeWorkbench'
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
  const initialCode = `// Three.js Workbench demo\n// Return an object to control the scene.\nreturn {\n  spinning: true,\n  wireframe: false,\n  showBackground: true,\n}`

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
                <NextLink href="/test/three/full">Full Screen</NextLink>
              </Button>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="embedded">
            <Card>
              <Box p="4">
                <Heading size="4" mb="2">Interactive 3D Cube (Workbench)</Heading>
                <Text color="gray" size="2" mb="3">Edit and run code to control the scene props. Click and drag to rotate the view.</Text>
                <ThreeWorkbench
                  id="three-embedded"
                  initialCode={initialCode}
                  autoRun={true}
                  showEditorDefault={false}
                  ui={{ workbench: true, viewerHeight: 384 }}
                />
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
