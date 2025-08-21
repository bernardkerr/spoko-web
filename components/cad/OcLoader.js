// Client-side OpenCascade loader for v1.1.1 with WASM locateFile hook
// Exposes loadOc() that returns a cached Promise of the initialized OC module

let ocPromise = null

export function loadOc() {
  if (typeof window === 'undefined') {
    throw new Error('OpenCascade can only be loaded on the client')
  }
  if (ocPromise) return ocPromise

  ocPromise = (async () => {
    // Dynamically import ESM entrypoint from CDN (v1.1.1)
    // Instruct webpack to ignore bundling this remote URL
    const mod = await import(/* webpackIgnore: true */ 'https://unpkg.com/opencascade.js@1.1.1/dist/opencascade.wasm.js')
    const initOpenCascade = mod?.default || mod
    if (typeof initOpenCascade !== 'function') {
      throw new Error('Failed to load OpenCascade initializer')
    }

    const oc = await initOpenCascade({
      locateFile: (path, prefix) => {
        if (path.endsWith('.wasm')) {
          return 'https://unpkg.com/opencascade.js@1.1.1/dist/' + path
        }
        return prefix + path
      },
    })

    // Basic sanity check on key APIs used later
    if (!oc?.BRepPrimAPI_MakeBox_2 || !oc?.BRepMesh_IncrementalMesh_2) {
      // Keep v1.1 contract stable; fail fast if unexpected shape
      throw new Error('OpenCascade v1.1 API mismatch: required constructors not found')
    }

    return oc
  })()

  return ocPromise
}
