'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssetPath } from '@/lib/paths'

export default function ThreePage() {
  const [spinning, setSpinning] = useState(false)
  const [wireframe, setWireframe] = useState(false)
  const [showBackground, setShowBackground] = useState(true)

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Three.js Examples</h1>
          <p className="text-muted-foreground">
            Interactive 3D graphics powered by Three.js and React Three Fiber.
          </p>
        </div>

        <Tabs defaultValue="embedded" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="embedded">Embedded Viewer</TabsTrigger>
            <TabsTrigger value="fullscreen">
              <Link href={getAssetPath('/three/full')}>
                Full Screen
              </Link>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="embedded" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive 3D Cube</CardTitle>
                <CardDescription>
                  Use the controls below to modify the 3D scene. Click and drag to rotate the view.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={spinning ? "default" : "outline"}
                    onClick={() => setSpinning(!spinning)}
                  >
                    {spinning ? 'Stop Spinning' : 'Start Spinning'}
                  </Button>
                  <Button
                    variant={wireframe ? "default" : "outline"}
                    onClick={() => setWireframe(!wireframe)}
                  >
                    {wireframe ? 'Solid' : 'Wireframe'}
                  </Button>
                  <Button
                    variant={showBackground ? "default" : "outline"}
                    onClick={() => setShowBackground(!showBackground)}
                  >
                    {showBackground ? 'Hide Background' : 'Show Background'}
                  </Button>
                </div>
                
                <div className="h-96 w-full rounded-lg border">
                  <ThreeCanvas
                    spinning={spinning}
                    wireframe={wireframe}
                    showBackground={showBackground}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="prose dark:prose-invert max-w-none">
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
      </div>
    </div>
  )
}
