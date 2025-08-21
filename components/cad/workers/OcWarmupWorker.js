// Module Worker to warm up OpenCascade assets (JS + WASM) in the HTTP cache
// No API surface is exposed; it simply imports the resources so subsequent
// main-thread initialization is fast. This worker does NOT initialize OC.

// Note: This is a module worker. Create it with:
// new Worker(new URL('../workers/OcWarmupWorker.js', import.meta.url), { type: 'module' })

self.postMessage({ type: 'status', message: 'warming' })

;(async () => {
  try {
    // Import both the JS wrapper and the wasm asset to get them into cache.
    // We avoid calling the initializer to keep work minimal.
    await Promise.all([
      import('opencascade.js'),
      import('opencascade.js/dist/opencascade.full.wasm'),
    ])
    self.postMessage({ type: 'done' })
  } catch (e) {
    self.postMessage({ type: 'error', message: e?.message || String(e) })
  }
})()
