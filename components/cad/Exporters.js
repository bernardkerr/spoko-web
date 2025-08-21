// Export helpers: STEP (OpenCascade), STL and GLTF (Three.js)
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportSTEP(oc, shape, filename = 'model.step') {
  if (!oc || !shape) throw new Error('Missing OpenCascade module or shape')
  // Clean any previous output
  try { oc.FS.unlink(filename) } catch {}

  const writer = new oc.STEPControl_Writer_1()
  // 1 = STEPControl_AsIs (v1.1 enums are numeric)
  const mode = 1
  const status1 = writer.Transfer(shape, mode)
  if (status1 !== 1) {
    // 1 means success (IFSelect_RetDone)
    throw new Error('STEP transfer failed')
  }
  const ok = writer.Write(filename)
  if (!ok) throw new Error('STEP write failed')

  const data = oc.FS.readFile(filename)
  const blob = new Blob([data], { type: 'application/step' })
  downloadBlob(filename, blob)
}

export function exportSTL(geometry, filename = 'model.stl', binary = true) {
  if (!geometry) throw new Error('No geometry to export')
  const exporter = new STLExporter()
  // Create a temp mesh to export correct transforms
  const mat = new THREE.MeshStandardMaterial()
  const mesh = new THREE.Mesh(geometry, mat)
  let result
  if (binary) {
    result = exporter.parse(mesh, { binary: true })
    const blob = new Blob([result], { type: 'application/vnd.ms-pki.stl' })
    downloadBlob(filename, blob)
  } else {
    result = exporter.parse(mesh)
    const blob = new Blob([result], { type: 'text/plain' })
    downloadBlob(filename, blob)
  }
  mat.dispose()
}

export function exportGLTF(geometry, filename = 'model.gltf', binary = false) {
  if (!geometry) throw new Error('No geometry to export')
  const exporter = new GLTFExporter()
  const mat = new THREE.MeshStandardMaterial()
  const mesh = new THREE.Mesh(geometry, mat)

  return new Promise((resolve, reject) => {
    exporter.parse(
      mesh,
      (gltf) => {
        try {
          if (binary) {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' })
            downloadBlob(filename.endsWith('.glb') ? filename : filename.replace(/\.gltf$/i, '.glb'), blob)
          } else {
            const json = JSON.stringify(gltf)
            const blob = new Blob([json], { type: 'application/json' })
            downloadBlob(filename, blob)
          }
          mat.dispose()
          resolve()
        } catch (e) {
          mat.dispose()
          reject(e)
        }
      },
      { binary }
    )
  })
}
