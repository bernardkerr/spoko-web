// Export helpers: STEP (OpenCascade), STL and GLTF (Three.js)
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  try {
    if (typeof window !== 'undefined') {
      // Helpful diagnostics
      console.log('[downloadBlob] triggering download:', filename, 'bytes:', blob?.size ?? 'unknown')
    }
    a.click()
  } catch (e) {
    // As a fallback, try opening in a new tab
    try { window.open(url, '_blank') } catch {}
  } finally {
    // Delay cleanup to avoid revoking before the browser starts fetching
    setTimeout(() => {
      try { a.remove() } catch {}
      try { URL.revokeObjectURL(url) } catch {}
    }, 1000)
  }
}

export async function saveBlobWithPicker(filename, blob) {
  // If the File System Access API is not available, fallback
  const hasPicker = typeof window !== 'undefined' && 'showSaveFilePicker' in window
  if (!hasPicker) {
    return downloadBlob(filename, blob)
  }
  const ext = (filename.split('.').pop() || '').toLowerCase()
  const typeMap = {
    step: { description: 'STEP', accept: { 'application/step': ['.step', '.stp'] } },
    stp: { description: 'STEP', accept: { 'application/step': ['.step', '.stp'] } },
    stl: { description: 'STL', accept: { 'application/vnd.ms-pki.stl': ['.stl'] } },
    glb: { description: 'GLB', accept: { 'model/gltf-binary': ['.glb'] } },
    gltf: { description: 'GLTF', accept: { 'model/gltf+json': ['.gltf'] } },
    json: { description: 'JSON', accept: { 'application/json': ['.json'] } },
  }
  const pickerType = typeMap[ext] || { description: 'File', accept: { 'application/octet-stream': ['.' + ext] } }
  const opts = {
    suggestedName: filename,
    types: [pickerType],
    excludeAcceptAllOption: false,
  }
  try {
    const handle = await window.showSaveFilePicker(opts)
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    if (typeof window !== 'undefined') {
      console.log('[saveBlobWithPicker] saved file via picker:', filename, 'bytes:', blob?.size ?? 'unknown')
    }
  } catch (e) {
    // If user cancels, just return; otherwise fallback to download for robustness
    if (e && e.name === 'AbortError') return
    try {
      downloadBlob(filename, blob)
    } catch {}
  }
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

export async function exportSTL(geometry, filename = 'model.stl', binary = true) {
  if (!geometry) throw new Error('No geometry to export')
  const exporter = new STLExporter()
  // Create a temp mesh to export correct transforms
  const mat = new THREE.MeshStandardMaterial()
  const mesh = new THREE.Mesh(geometry, mat)
  let result
  if (binary) {
    result = exporter.parse(mesh, { binary: true })
    const blob = new Blob([result], { type: 'application/vnd.ms-pki.stl' })
    await saveBlobWithPicker(filename, blob)
  } else {
    result = exporter.parse(mesh)
    const blob = new Blob([result], { type: 'text/plain' })
    await saveBlobWithPicker(filename, blob)
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
      async (gltf) => {
        try {
          let outName = filename
          let blob
          if (binary) {
            // GLTFExporter (binary:true) may return ArrayBuffer or a TypedArray
            let buf = null
            if (gltf instanceof ArrayBuffer) {
              buf = gltf
            } else if (ArrayBuffer.isView(gltf)) {
              // Respect view window of the underlying buffer
              buf = gltf.buffer.slice(gltf.byteOffset, gltf.byteOffset + gltf.byteLength)
            } else if (gltf && typeof gltf === 'object') {
              // Some environments may still return a JSON object; fall back to .gltf JSON
              const json = JSON.stringify(gltf)
              blob = new Blob([json], { type: 'application/json' })
              outName = filename.endsWith('.gltf') ? filename : filename.replace(/\.glb$/i, '.gltf')
            }
            if (!blob && buf) {
              blob = new Blob([buf], { type: 'model/gltf-binary' })
              outName = filename.endsWith('.glb') ? filename : filename.replace(/\.gltf$/i, '.glb')
            }
          } else {
            // JSON glTF
            const json = typeof gltf === 'string' ? gltf : JSON.stringify(gltf)
            blob = new Blob([json], { type: 'application/json' })
            outName = filename.endsWith('.gltf') ? filename : filename.replace(/\.glb$/i, '.gltf')
          }
          await saveBlobWithPicker(outName, blob)
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
