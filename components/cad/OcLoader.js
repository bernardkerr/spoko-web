// Client-side OpenCascade loader using bundled ocjs v2 (@beta)
// Exposes loadOc() that returns a cached Promise of the initialized OC module

let ocPromise = null

export function loadOc() {
  if (typeof window === 'undefined') {
    throw new Error('OpenCascade can only be loaded on the client')
  }
  if (ocPromise) return ocPromise

  ocPromise = (async () => {
    // Dynamically import the NPM package and its WASM asset so it only loads on the client
    const [mod, wasm] = await Promise.all([
      import('opencascade.js'),
      import('opencascade.js/dist/opencascade.full.wasm'),
    ])
    const wasmUrl = (wasm && (wasm.default || wasm))
    const initOpenCascade = mod?.default || mod?.initOpenCascade || mod
    if (typeof initOpenCascade !== 'function') {
      throw new Error('Failed to load OpenCascade initializer from opencascade.js')
    }

    // Provide locateFile so emscripten resolves the emitted wasm URL
    const oc = await initOpenCascade({
      locateFile: (path) => {
        if (typeof path === 'string' && path.endsWith('.wasm') && wasmUrl) return wasmUrl
        return path
      },
    })

    // Soft sanity check: avoid brittle overload checks; just ensure module object exists
    if (!oc) {
      // Prefer not to throw here to allow environment to report precise errors later
      console.warn('OpenCascade module loaded but is falsy')
    }

    return oc
  })()

  return ocPromise
}
