'use client'

import { useImperativeHandle } from 'react'

/**
 * Standardizes the imperative ref interface for all workbenches.
 * Exposes: run(), reset(), fitView()
 * - Pass no-ops for handlers that don't apply to a workbench.
 */
export function useWorkbenchInterface(ref, handlers = {}) {
  const { run, reset, fitView } = handlers
  useImperativeHandle(ref, () => ({
    run: typeof run === 'function' ? run : () => {},
    reset: typeof reset === 'function' ? reset : () => {},
    fitView: typeof fitView === 'function' ? fitView : () => {},
  }), [run, reset, fitView])
}
