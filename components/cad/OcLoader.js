// Client-side OpenCascade loader using bundled ocjs v2 (@beta)
// Exposes loadOc() that returns a cached Promise of the initialized OC module

let ocPromise = null

export function loadOc() {
  // Note: allow running in workers too (no strict window check)
  // Share a single promise across chunks/routes within the same session
  const g = (typeof globalThis !== 'undefined') ? globalThis : undefined
  if (!ocPromise && g && g.__spoko_oc_init_promise) {
    ocPromise = g.__spoko_oc_init_promise
  }
  if (ocPromise) return ocPromise

  ocPromise = (async () => {
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    console.time('[OC] import total')
    console.time('[OC] import js')
    const jsPromise = import('opencascade.js').then((m) => {
      console.timeEnd('[OC] import js')
      return m
    })
    console.time('[OC] import wasm')
    const wasmPromise = import('opencascade.js/dist/opencascade.full.wasm').then((w) => {
      console.timeEnd('[OC] import wasm')
      return w
    })
    // Dynamically import the NPM package and its WASM asset
    const [mod, wasm] = await Promise.all([jsPromise, wasmPromise])
    console.timeEnd('[OC] import total')

    const wasmUrl = (wasm && (wasm.default || wasm))
    const initOpenCascade = mod?.default || mod?.initOpenCascade || mod
    if (typeof initOpenCascade !== 'function') {
      throw new Error('Failed to load OpenCascade initializer from opencascade.js')
    }

    // Provide locateFile so emscripten resolves the emitted wasm URL
    console.time('[OC] initOpenCascade')
    const oc = await initOpenCascade({
      locateFile: (path) => {
        if (typeof path === 'string' && path.endsWith('.wasm') && wasmUrl) return wasmUrl
        return path
      },
    })
    console.timeEnd('[OC] initOpenCascade')

    // Soft sanity check: avoid brittle overload checks; just ensure module object exists
    if (!oc) {
      // Prefer not to throw here to allow environment to report precise errors later
      console.warn('OpenCascade module loaded but is falsy')
    }

    const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    const dt = Math.round(t1 - t0)
    console.log(`[OC] ready in ${dt}ms`)
    return oc
  })()

  // Expose globally so other chunks/pages reuse the same initialization
  try {
    const g2 = (typeof globalThis !== 'undefined') ? globalThis : undefined
    if (g2) g2.__spoko_oc_init_promise = ocPromise
  } catch {}

  return ocPromise
}
