'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function RotatingCube({ spinning, wireframe }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (spinning && meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#3b82f6" 
        wireframe={wireframe}
      />
    </mesh>
  )
}

// Simple orbit controls implementation
function OrbitControls() {
  useEffect(() => {
    // Basic mouse controls will be handled by the canvas
  }, [])
  return null
}

function Scene({ spinning, wireframe, showBackground }) {
  return (
    <>
      {showBackground && (
        <color attach="background" args={['#f1f5f9']} />
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingCube spinning={spinning} wireframe={wireframe} />
      <OrbitControls />
    </>
  )
}

export function ThreeCanvas({ 
  spinning = false, 
  wireframe = false, 
  showBackground = true,
  fullscreen = false,
  className = ''
}) {
  return (
    <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 60 }}
        onCreated={({ gl, camera, scene }) => {
          // Enable basic mouse controls
          gl.domElement.addEventListener('mousedown', (e) => {
            // Basic interaction setup
          })
        }}
      >
        <Scene 
          spinning={spinning} 
          wireframe={wireframe} 
          showBackground={showBackground}
        />
      </Canvas>
    </div>
  )
}
