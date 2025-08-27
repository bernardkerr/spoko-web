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
  const initialCode = `// Three.js Workbench demo (program mode)\n// Optionally return a lifecycle object to create a custom scene.\n// Tip: You can also return legacy props instead.\nreturn {\n  async setup({ THREE, add, materials, themeColors }) {\n    const geo = new THREE.TorusKnotGeometry(1.2, 0.35, 150, 16)\n    const mat = materials.standard({ color: themeColors.accent, roughness: 0.35, metalness: 0.2 })\n    const mesh = new THREE.Mesh(geo, mat)\n    add(mesh)\n    this.mesh = mesh\n  },\n  update({ dt }) { if (this.mesh) this.mesh.rotation.y += dt * 0.8 },\n  dispose({ remove }) { if (this.mesh) { remove(this.mesh); this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.mesh = null } },\n  onPointerDown(e, { THREE, themeColors }) { if (this.mesh) { this.mesh.material.wireframe = !this.mesh.material.wireframe } },\n}`

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
                <Heading size="4" mb="2">Three.js Program Workbench</Heading>
                <Text color="gray" size="2" mb="3">Return legacy props or a program object with setup/update/dispose to build full scenes. Drag to orbit; click toggles wireframe.</Text>
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
