'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// Animated cube component
function AnimatedCube({ spinning, wireframe }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (spinning && meshRef.current) {
      meshRef.current.rotation.x += delta * 1
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color={0x3b82f6} 
        wireframe={wireframe}
      />
    </mesh>
  )
}

// Background plane component
function BackgroundPlane({ showBackground }) {
  if (!showBackground) return null
  
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color={0xf1f5f9} />
    </mesh>
  )
}

// Scene setup component
function Scene({ spinning, wireframe, showBackground }) {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* 3D Objects */}
      <AnimatedCube spinning={spinning} wireframe={wireframe} />
      <BackgroundPlane showBackground={showBackground} />
    </>
  )
}

// Loading component
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <div className="flex items-center text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
        <span className="ml-2">Loading 3D scene...</span>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorFallback({ error, resetError }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-center p-4">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-semibold">3D Canvas Error</h3>
      </div>
      <p className="text-muted-foreground mb-4">{error?.message || 'Failed to initialize 3D scene'}</p>
      <button 
        onClick={resetError}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// Client-side detection hook
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient
}

export function ThreeCanvas({ 
  spinning = true, 
  wireframe = false, 
  showBackground = true,
  fullscreen = false,
  className = ''
}) {
  const [error, setError] = useState(null)
  const isClient = useIsClient()

  const handleError = (error) => {
    console.error('Three.js Canvas Error:', error)
    setError(error)
  }

  const resetError = () => {
    setError(null)
  }

  // Don't render on server side
  if (!isClient) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <LoadingFallback />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <ErrorFallback error={error} resetError={resetError} />
      </div>
    )
  }

  return (
    <div 
      className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}
      style={{ width: '100%', height: '400px', position: 'relative' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'default'
          }}
          onError={handleError}
          style={{ background: '#f1f5f9' }}
        >
          <Scene 
            spinning={spinning} 
            wireframe={wireframe} 
            showBackground={showBackground} 
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
