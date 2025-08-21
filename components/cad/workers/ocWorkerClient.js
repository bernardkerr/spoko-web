// Singleton client for the OC module worker, shared across pages

let worker = null
let reqId = 1
const pending = new Map()
let ready = false
let readyResolve
const readyPromise = new Promise((res) => { readyResolve = res })
const readyListeners = new Set()

function ensureWorker() {
  if (worker) return worker
  const g = typeof globalThis !== 'undefined' ? globalThis : {}
  if (g.__spoko_oc_worker) {
    worker = g.__spoko_oc_worker
    return worker
  }
  worker = new Worker(new URL('./OcWorker.js', import.meta.url), { type: 'module' })
  g.__spoko_oc_worker = worker
  worker.onmessage = (ev) => {
    const msg = ev.data || {}
    if (msg && msg.type === 'ready') {
      if (!ready) {
        ready = true
        try { readyResolve?.() } catch {}
        for (const cb of readyListeners) {
          try { cb() } catch {}
        }
        readyListeners.clear()
      }
      // If this 'ready' corresponds to a pending id, resolve that too
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id)
        pending.delete(msg.id)
        resolve(msg)
      }
      return
    }
    if (msg && msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.type === 'error') reject(new Error(msg.message || 'Worker error'))
      else resolve(msg)
      return
    }
    // Broadcast-only messages (e.g., ready without id) are ignored here
  }
  worker.onerror = (e) => {
    // Fail all pending on fatal worker error
    for (const { reject } of pending.values()) reject(e)
    pending.clear()
  }
  return worker
}

export function getOcWorker() {
  return ensureWorker()
}

export function callOcWorker(type, payload = {}) {
  const w = ensureWorker()
  const id = `${Date.now()}-${reqId++}`
  const msg = { id, type, ...payload }
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    w.postMessage(msg)
  })
}

export function isOcWorkerReady() {
  ensureWorker()
  return ready
}

export function waitForOcWorkerReady() {
  ensureWorker()
  return ready ? Promise.resolve() : readyPromise
}

export function onOcWorkerReady(cb) {
  ensureWorker()
  if (ready) {
    queueMicrotask(() => cb())
    return () => {}
  }
  readyListeners.add(cb)
  return () => readyListeners.delete(cb)
}
