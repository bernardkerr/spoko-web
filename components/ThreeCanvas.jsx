'use client'

import { useRef, useEffect, useState } from 'react'

export function ThreeCanvas({ 
  spinning = true, 
  wireframe = false, 
  showBackground = true,
  fullscreen = false,
  className = ''
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Detect client-side rendering first
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize Three.js only on client side
  useEffect(() => {
    if (!isClient) return
    
    let scene, camera, renderer, cube, animationId
    let mounted = true

    const initThree = async () => {
      try {
        // Import Three.js dynamically to avoid SSR issues
        const THREE = await import('three')
        
        if (!mounted || !mountRef.current) return

        // Check if mount point is still valid
        if (!mountRef.current) return
        
        // Clear any existing Three.js content completely
        const existingCanvases = mountRef.current.querySelectorAll('canvas')
        existingCanvases.forEach(canvas => {
          // Lose the WebGL context before removing
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          if (gl && gl.getExtension('WEBGL_lose_context')) {
            gl.getExtension('WEBGL_lose_context').loseContext()
          }
          if (canvas.parentNode === mountRef.current) {
            mountRef.current.removeChild(canvas)
          }
        })

        // Create scene
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf1f5f9)

        // Create camera
        camera = new THREE.PerspectiveCamera(
          60,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
        )
        camera.position.set(5, 5, 5)
        camera.lookAt(0, 0, 0)

        // Create a completely fresh canvas with unique ID
        const canvas = document.createElement('canvas')
        canvas.id = `three-canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        canvas.style.display = 'block'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        
        // Try to create WebGL context with error handling
        let renderer
        try {
          renderer = new THREE.WebGLRenderer({ 
            canvas,
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          })
        } catch (error) {
          console.error('WebGL renderer creation failed:', error)
          throw new Error('WebGL not supported or context creation failed')
        }
        
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
        renderer.setClearColor(0xf1f5f9, 1)
        
        // Safely append canvas to mount point
        if (mountRef.current && !mountRef.current.contains(canvas)) {
          mountRef.current.appendChild(renderer.domElement)
        }

        // Create cube
        const geometry = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x3b82f6,
          wireframe: wireframe
        })
        cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)
        
        const pointLight = new THREE.PointLight(0xffffff, 1, 100)
        pointLight.position.set(10, 10, 10)
        scene.add(pointLight)

        // Add background plane if needed
        if (showBackground) {
          const planeGeometry = new THREE.PlaneGeometry(20, 20)
          const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
          const plane = new THREE.Mesh(planeGeometry, planeMaterial)
          plane.position.z = -5
          scene.add(plane)
        }

        // Animation loop
        const animate = () => {
          if (!mounted) return
          
          animationId = requestAnimationFrame(animate)
          
          if (spinning && cube) {
            cube.rotation.x += 0.016
            cube.rotation.y += 0.008
          }
          
          if (renderer && scene && camera) {
            renderer.render(scene, camera)
          }
        }

        // Handle resize
        const handleResize = () => {
          if (!mounted || !mountRef.current || !camera || !renderer) return
          
          const width = mountRef.current.clientWidth
          const height = mountRef.current.clientHeight
          
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }

        window.addEventListener('resize', handleResize)
        
        // Start animation
        animate()
        setIsLoading(false)
        setError(null)

        // Store refs for cleanup
        sceneRef.current = {
          scene,
          camera,
          renderer,
          cube,
          animationId,
          handleResize,
          cleanup: () => {
            mounted = false
            
            // Stop animation loop
            if (animationId) {
              cancelAnimationFrame(animationId)
            }
            
            // Remove event listeners
            window.removeEventListener('resize', handleResize)
            
            // Dispose of Three.js resources
            if (renderer) {
              // Lose WebGL context before disposal
              const gl = renderer.getContext()
              if (gl && gl.getExtension('WEBGL_lose_context')) {
                gl.getExtension('WEBGL_lose_context').loseContext()
              }
              
              renderer.dispose()
              
              // Only remove canvas if it's still a child
              if (renderer.domElement && renderer.domElement.parentNode === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement)
              }
            }
            
            // Clear scene
            if (scene) {
              scene.clear()
            }
            
            // Clear geometry and materials
            if (cube) {
              if (cube.geometry) cube.geometry.dispose()
              if (cube.material) cube.material.dispose()
            }
          }
        }

      } catch (err) {
        console.error('Three.js initialization error:', err)
        setError(err.message || 'Failed to initialize 3D scene')
        setIsLoading(false)
      }
    }

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initThree, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      
      // Cleanup Three.js resources safely
      if (sceneRef.current) {
        try {
          sceneRef.current.cleanup()
        } catch (error) {
          console.warn('Cleanup error:', error)
        }
        sceneRef.current = null
      }
    }
  }, [isClient, spinning, wireframe, showBackground])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    window.location.reload()
  }

  if (!isClient) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span className="ml-2">Initializing...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">3D Canvas Error</h3>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mountRef} 
      className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}
      style={{ width: '100%', height: '400px', position: 'relative' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="flex items-center text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
            <span className="ml-2">Loading 3D scene...</span>
          </div>
        </div>
      )}
    </div>
  )
}
