'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Callout, Text, Button, Card, Heading } from '@radix-ui/themes'
import { Wrench, Eye } from 'lucide-react'

/**
 * Workbench: Reusable viewer shell with overlay slots and toolbar placement.
 *
 * Props:
 * - viewer: ReactNode (required) — the actual viewer component (e.g., ThreeCadViewer)
 * - overlayTopLeft, overlayTopRight, overlayBottomLeft, overlayBottomRight: ReactNode
 * - toolbar: ReactNode — action bar rendered above or below the viewer
 * - toolbarPosition: 'top' | 'bottom' (default: 'bottom')
 * - viewerHeight: number (default: 520)
 * - status: string
 * - error: string | null
 * - statusBar: ReactNode — optional custom status area; if not provided, default is rendered from status/error
 *
 * Editor (optional):
 * - editor: ReactNode — main editor content
 * - editorTitle: ReactNode — heading for editor panel (default: 'Editor')
 * - editorSubtext: ReactNode — helper text shown under the title
 * - editorActions: ReactNode — action buttons row under the editor (e.g., Run, Reset)
 * - editorAside: ReactNode — optional extra content under actions (e.g., docs helper)
 * - editorOpen: boolean — controlled open/closed
 * - defaultEditorOpen: boolean — uncontrolled initial state (default: false)
 * - onEditorOpenChange(v: boolean) — callback on open/close changes
 * - showEditorToggle: boolean — show default Open/Close editor buttons (default: true)
 */
export default function Workbench({
  viewer,
  overlayTopLeft,
  overlayTopRight,
  overlayBottomLeft,
  overlayBottomRight,
  toolbar,
  toolbarPosition = 'bottom',
  // Height handling
  viewerHeight,
  viewerHeightVisible = 520,
  viewerHeightHidden = 520,
  // Visibility control (controlled/uncontrolled)
  workbenchVisible,
  defaultWorkbenchVisible = false,
  onWorkbenchVisibleChange,
  persistVisibilityKey,
  showToggle = true,
  provideWorkbenchControls,
  // Default viewer actions (optional)
  showDefaultViewerActions,
  viewerApi,
  viewerFitLabel = 'Fit View',
  viewerResetLabel = 'Reset View',
  // Keyboard shortcuts
  shortcuts,
  onShortcut,
  // Editor support
  editor,
  editorTitle = 'Editor',
  editorSubtext,
  editorActions,
  editorAside,
  editorOpen,
  defaultEditorOpen = false,
  onEditorOpenChange,
  showEditorToggle = true,
  // Fine-grained editor toggle control
  showEditorOpenToggleTopRight,
  showEditorHeaderClose,
  provideEditorControls,
  // Default editor actions (optional)
  showDefaultEditorActions,
  onRun,
  onRunStart,
  onRunEnd,
  onResetToLast,
  onResetToOriginal,
  runDisabled,
  running,
  runLabel = 'Run',
  resetLastLabel = 'Reset to Last Running',
  resetOriginalLabel = 'Reset to Original',
  // Docs helper support managed by Workbench
  docsAside,
  docsOpen,
  defaultDocsOpen = false,
  onDocsOpenChange,
  docsHelperLabelClosed = 'Docs Helper',
  docsHelperLabelOpen = 'Hide Docs Helper',
  // Optional editor API to enable default reset behaviors without callbacks
  editorApi,
  // Optional editor header actions (right side of title)
  editorHeaderActions,
  // Error boundary around editor area
  wrapEditorWithErrorBoundary = false,
  editorErrorBoundary: EditorErrorBoundaryExternal,
  // Status
  status,
  error,
  statusBar,
}) {
  // Determine visibility (controlled vs uncontrolled)
  const isControlled = typeof workbenchVisible === 'boolean'
  const [internalVisible, setInternalVisible] = useState(() => {
    if (isControlled) return workbenchVisible
    if (persistVisibilityKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`wb:visible:${persistVisibilityKey}`)
      if (saved === 'true') return true
      if (saved === 'false') return false
    }
    return !!defaultWorkbenchVisible
  })

  // Inform parent of initial visibility when uncontrolled, so it can mirror UI outside Workbench
  useEffect(() => {
    if (!isControlled) onWorkbenchVisibleChange?.(internalVisible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync internal with controlled prop
  useEffect(() => {
    if (isControlled) setInternalVisible(!!workbenchVisible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, workbenchVisible])

  // Persist when uncontrolled
  useEffect(() => {
    if (!isControlled && persistVisibilityKey && typeof window !== 'undefined') {
      try { localStorage.setItem(`wb:visible:${persistVisibilityKey}`, internalVisible ? 'true' : 'false') } catch {}
    }
  }, [internalVisible, isControlled, persistVisibilityKey])

  const setVisible = useCallback((next) => {
    const v = typeof next === 'function' ? next(isControlled ? !!workbenchVisible : internalVisible) : !!next
    if (!isControlled) setInternalVisible(v)
    onWorkbenchVisibleChange?.(v)
  }, [isControlled, internalVisible, workbenchVisible, onWorkbenchVisibleChange])

  const toggle = useCallback(() => setVisible(v => !v), [setVisible])

  const effectiveVisible = isControlled ? !!workbenchVisible : internalVisible
  const effectiveHeight = useMemo(() => {
    if (typeof viewerHeight === 'number') return viewerHeight
    return effectiveVisible ? viewerHeightVisible : viewerHeightHidden
  }, [viewerHeight, viewerHeightVisible, viewerHeightHidden, effectiveVisible])

  // Expose workbench controls to parent
  useEffect(() => {
    if (!provideWorkbenchControls) return
    const controls = {
      open: () => setVisible(true),
      close: () => setVisible(false),
      toggle: () => toggle(),
      isVisible: () => (isControlled ? !!workbenchVisible : internalVisible),
    }
    try { provideWorkbenchControls(controls) } catch {}
  }, [provideWorkbenchControls, setVisible, toggle, isControlled, workbenchVisible, internalVisible])

  // Editor open/close (controlled vs uncontrolled)
  const isEditorControlled = typeof editorOpen === 'boolean'
  const [internalEditorOpen, setInternalEditorOpen] = useState(() => {
    if (isEditorControlled) return !!editorOpen
    if (persistVisibilityKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`wb:editor:${persistVisibilityKey}`)
      if (saved === 'true') return true
      if (saved === 'false') return false
    }
    return !!defaultEditorOpen
  })

  // Inform parent of initial editor state when uncontrolled
  useEffect(() => {
    if (!isEditorControlled) onEditorOpenChange?.(internalEditorOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isEditorControlled) setInternalEditorOpen(!!editorOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditorControlled, editorOpen])

  // Persist editor state when uncontrolled
  useEffect(() => {
    if (!isEditorControlled && persistVisibilityKey && typeof window !== 'undefined') {
      try { localStorage.setItem(`wb:editor:${persistVisibilityKey}`, internalEditorOpen ? 'true' : 'false') } catch {}
    }
  }, [internalEditorOpen, isEditorControlled, persistVisibilityKey])

  const setEditorOpenState = useCallback((next) => {
    const v = typeof next === 'function' ? next(isEditorControlled ? !!editorOpen : internalEditorOpen) : !!next
    if (!isEditorControlled) setInternalEditorOpen(v)
    onEditorOpenChange?.(v)
  }, [isEditorControlled, internalEditorOpen, editorOpen, onEditorOpenChange])

  // Back-compat defaults: if fine-grained flags are not provided, fall back to showEditorToggle
  const showOpenTopRight = (typeof showEditorOpenToggleTopRight === 'boolean' ? showEditorOpenToggleTopRight : showEditorToggle)
  const showHeaderClose = (typeof showEditorHeaderClose === 'boolean' ? showEditorHeaderClose : showEditorToggle)

  // Expose editor controls to parent (open/close/toggle/isOpen)
  useEffect(() => {
    if (!provideEditorControls) return
    const controls = {
      open: () => setEditorOpenState(true),
      close: () => setEditorOpenState(false),
      toggle: () => setEditorOpenState(v => !v),
      isOpen: () => (isEditorControlled ? !!editorOpen : internalEditorOpen),
    }
    try { provideEditorControls(controls) } catch {}
    // no cleanup needed; parent can overwrite on re-render
  }, [provideEditorControls, setEditorOpenState, isEditorControlled, editorOpen, internalEditorOpen])

  // Docs helper open/close (controlled vs uncontrolled)
  const isDocsControlled = typeof docsOpen === 'boolean'
  const [internalDocsOpen, setInternalDocsOpen] = useState(() => {
    if (isDocsControlled) return !!docsOpen
    if (persistVisibilityKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`wb:docs:${persistVisibilityKey}`)
      if (saved === 'true') return true
      if (saved === 'false') return false
    }
    return !!defaultDocsOpen
  })
  useEffect(() => {
    if (isDocsControlled) setInternalDocsOpen(!!docsOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDocsControlled, docsOpen])
  const setDocsOpenState = useCallback((next) => {
    const v = typeof next === 'function' ? next(isDocsControlled ? !!docsOpen : internalDocsOpen) : !!next
    if (!isDocsControlled) setInternalDocsOpen(v)
    onDocsOpenChange?.(v)
  }, [isDocsControlled, internalDocsOpen, docsOpen, onDocsOpenChange])
  // Persist docs open state when uncontrolled
  useEffect(() => {
    if (!isDocsControlled && persistVisibilityKey && typeof window !== 'undefined') {
      try { localStorage.setItem(`wb:docs:${persistVisibilityKey}`, internalDocsOpen ? 'true' : 'false') } catch {}
    }
  }, [internalDocsOpen, isDocsControlled, persistVisibilityKey])
  // Auto-close docs when editor closes
  useEffect(() => {
    if (!internalEditorOpen && internalDocsOpen) setDocsOpenState(false)
  }, [internalEditorOpen, internalDocsOpen, setDocsOpenState])

  // Running state management for default Run button
  const [internalRunning, setInternalRunning] = useState(false)
  const handleRunClick = useCallback(async () => {
    if (!onRun) return
    try {
      setInternalRunning(true)
      onRunStart?.()
      await onRun()
    } catch (e) {
      // swallow; parent can surface error via status/error props
    } finally {
      setInternalRunning(false)
      onRunEnd?.()
    }
  }, [onRun, onRunStart, onRunEnd])

  // Keyboard shortcuts
  const shortcutMap = useMemo(() => ({
    run: 'MetaOrCtrl+Enter',
    toggleEditor: 'MetaOrCtrl+E',
    toggleWorkbench: 'MetaOrCtrl+Shift+E',
    toggleDocs: 'MetaOrCtrl+/',
    fitView: 'F',
    resetView: 'R',
    ...(shortcuts || {}),
  }), [shortcuts])

  const matchShortcut = useCallback((spec, e) => {
    if (!spec) return false
    const parts = String(spec).split('+')
    let needMetaOrCtrl = false, needShift = false, key = ''
    parts.forEach(p => {
      const s = p.trim().toLowerCase()
      if (s === 'metaorctrl') needMetaOrCtrl = true
      else if (s === 'shift') needShift = true
      else key = s
    })
    if (needMetaOrCtrl && !(e.metaKey || e.ctrlKey)) return false
    if (needShift && !e.shiftKey) return false
    if (key) {
      if (key === 'enter' && e.key.toLowerCase() !== 'enter') return false
      else if (key !== 'enter' && e.key.toLowerCase() !== key) return false
    }
    return true
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKey = (e) => {
      if (!effectiveVisible) return
      if (e.defaultPrevented) return
      const tag = (e.target && e.target.tagName) ? String(e.target.tagName).toLowerCase() : ''
      if (tag === 'input' || tag === 'textarea') return
      if ((e.target && e.target.isContentEditable) || false) return

      const handle = (action) => {
        const res = onShortcut?.(action, e)
        if (res === false) return // allow parent to cancel default
        e.preventDefault()
        if (action === 'run' && onRun) handleRunClick()
        else if (action === 'toggleEditor' && editor) setEditorOpenState(v => !v)
        else if (action === 'toggleWorkbench') toggle()
        else if (action === 'toggleDocs' && docsAside) setDocsOpenState(v => !v)
        else if (action === 'fitView' && viewerApi?.fitView) viewerApi.fitView()
        else if (action === 'resetView' && viewerApi?.reset) viewerApi.reset()
      }

      if (matchShortcut(shortcutMap.run, e)) return handle('run')
      if (matchShortcut(shortcutMap.toggleEditor, e)) return handle('toggleEditor')
      if (matchShortcut(shortcutMap.toggleWorkbench, e)) return handle('toggleWorkbench')
      if (matchShortcut(shortcutMap.toggleDocs, e)) return handle('toggleDocs')
      if (matchShortcut(shortcutMap.fitView, e)) return handle('fitView')
      if (matchShortcut(shortcutMap.resetView, e)) return handle('resetView')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [effectiveVisible, onShortcut, shortcutMap, matchShortcut, onRun, editor, docsAside, viewerApi, handleRunClick, setEditorOpenState, toggle, setDocsOpenState])

  // Editor error boundary wrapper
  const EditorWrapper = useMemo(() => {
    if (!wrapEditorWithErrorBoundary) return React.Fragment
    if (EditorErrorBoundaryExternal) return EditorErrorBoundaryExternal
    class SimpleEditorErrorBoundary extends React.Component {
      constructor(props) { super(props); this.state = { hasError: false, error: null } }
      static getDerivedStateFromError(error) { return { hasError: true, error } }
      componentDidCatch(error, info) { /* no-op */ }
      render() {
        if (this.state.hasError) {
          return (
            <Box mt="3">
              <Callout.Root color="red"><Callout.Text>{String(this.state.error?.message || this.state.error || 'Editor crashed')}</Callout.Text></Callout.Root>
            </Box>
          )
        }
        return this.props.children
      }
    }
    return SimpleEditorErrorBoundary
  }, [wrapEditorWithErrorBoundary, EditorErrorBoundaryExternal])

  return (
    <>
      {/* Top toolbar and viewer default actions */}
      {toolbarPosition === 'top' && effectiveVisible && (
        <Box mt="3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {showDefaultViewerActions && viewerApi && (
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button variant="surface" onClick={() => viewerApi?.fitView?.()}>{viewerFitLabel}</Button>
              <Button variant="surface" onClick={() => viewerApi?.reset?.()}>{viewerResetLabel}</Button>
            </Box>
          )}
          {toolbar && (
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{toolbar}</Box>
          )}
        </Box>
      )}

      <Box
        className="viewer-shell"
        style={{
          position: 'relative',
          width: '100%',
          height: effectiveHeight,
          minHeight: 280,
          borderRadius: 8,
          border: '1px solid var(--gray-a6)',
          overflow: 'visible',
          boxSizing: 'border-box',
          background: '#ffffff',
        }}
      >
        {/* Built-in top-right workbench visibility toggle and custom overlay */}
        {showToggle && (
          <Box style={{ position: 'absolute', top: 8, right: 8, zIndex: 20, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                size="1"
                variant="ghost"
                onClick={toggle}
                style={{ opacity: 0.9, padding: 6, minWidth: 0 }}
                aria-label={effectiveVisible ? 'Viewer only' : 'Open workbench'}
                title={effectiveVisible ? 'Viewer only' : 'Open workbench'}
              >
                {effectiveVisible ? (
                  <Eye width={28} height={28} strokeWidth={2} />
                ) : (
                  <Wrench width={28} height={28} strokeWidth={2} />
                )}
              </Button>
              {overlayTopRight}
            </div>
          </Box>
        )}

        {/* Overlays: pointer-events none wrapper; inner enables click */}
        {effectiveVisible && overlayTopLeft && (
          <Box style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>{overlayTopLeft}</div>
          </Box>
        )}
        {effectiveVisible && overlayBottomLeft && (
          <Box style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>{overlayBottomLeft}</div>
          </Box>
        )}
        {effectiveVisible && overlayBottomRight && (
          <Box style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>{overlayBottomRight}</div>
          </Box>
        )}

        {/* Viewer content */}
        {viewer}
      </Box>

      {/* Bottom toolbar and viewer default actions */}
      {toolbarPosition === 'bottom' && effectiveVisible && (
        <Box mt="3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {showDefaultViewerActions && viewerApi && (
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button variant="surface" onClick={() => viewerApi?.fitView?.()}>{viewerFitLabel}</Button>
              <Button variant="surface" onClick={() => viewerApi?.reset?.()}>{viewerResetLabel}</Button>
            </Box>
          )}
          {toolbar && (
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{toolbar}</Box>
          )}
          {showEditorToggle && editor && !internalEditorOpen && (
            <Box>
              <Button variant="solid" onClick={() => setEditorOpenState(true)}>Open Editor</Button>
            </Box>
          )}
        </Box>
      )}

      {/* Status / Error */}
      {effectiveVisible && (statusBar ?? (
        (status || error) ? (
          <Box mt="3">
            {status && (
              <Text size="2" color={error ? 'red' : 'gray'}>
                Status: {status}
              </Text>
            )}
            {error && (
              <Box mt="2">
                <Callout.Root color="red">
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              </Box>
            )}
          </Box>
        ) : null
      ))}

      {/* Editor Section */}
      {effectiveVisible && editor && internalEditorOpen && (
        <Box mt="6">
          <Card>
            <Box p="4">
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading size="6">{editorTitle}</Heading>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editorHeaderActions}
                  {showHeaderClose && (
                    <Button variant="ghost" onClick={() => setEditorOpenState(false)}>Close</Button>
                  )}
                </Box>
              </Box>
              {editorSubtext && (
                <Box mt="1">
                  <Text as="p" color="gray" size="2">{editorSubtext}</Text>
                </Box>
              )}
              <Box mt="3">
                <EditorWrapper>
                  {editor}
                </EditorWrapper>
              </Box>
              {editorActions ? (
                <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {editorActions}
                </Box>
              ) : (showDefaultEditorActions ? (
                <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {onRun && (
                    <Button onClick={handleRunClick} disabled={!!runDisabled || !!running || internalRunning}>{runLabel}</Button>
                  )}
                  {(onResetToLast || editorApi?.resetToLast) && (
                    <Button
                      variant="soft"
                      onClick={() => { onResetToLast ? onResetToLast() : editorApi?.resetToLast?.() }}
                    >
                      {resetLastLabel}
                    </Button>
                  )}
                  {(onResetToOriginal || editorApi?.resetToOriginal) && (
                    <Button
                      variant="soft"
                      onClick={() => { onResetToOriginal ? onResetToOriginal() : editorApi?.resetToOriginal?.() }}
                    >
                      {resetOriginalLabel}
                    </Button>
                  )}
                  {docsAside && (
                    <Button variant="surface" onClick={() => setDocsOpenState(v => !v)}>
                      {internalDocsOpen ? docsHelperLabelOpen : docsHelperLabelClosed}
                    </Button>
                  )}
                </Box>
              ) : null)}
              {docsAside && internalDocsOpen && (
                <Box mt="3">{docsAside}</Box>
              )}
            </Box>
          </Card>
        </Box>
      )}
    </>
  )
}
