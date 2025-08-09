'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getAssetPath } from '@/lib/paths'

export default function ThreeFullPage() {
  const [spinning, setSpinning] = useState(true)
  const [wireframe, setWireframe] = useState(false)

  return (
    <div className="relative h-screen w-screen">
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
        <Link href={getAssetPath('/three')}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Button
          variant={spinning ? "default" : "outline"}
          size="sm"
          onClick={() => setSpinning(!spinning)}
        >
          {spinning ? 'Stop' : 'Spin'}
        </Button>
        <Button
          variant={wireframe ? "default" : "outline"}
          size="sm"
          onClick={() => setWireframe(!wireframe)}
        >
          {wireframe ? 'Solid' : 'Wire'}
        </Button>
      </div>

      {/* Full-screen canvas */}
      <ThreeCanvas
        spinning={spinning}
        wireframe={wireframe}
        showBackground={true}
        fullscreen={true}
      />
    </div>
  )
}
