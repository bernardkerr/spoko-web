'use client'

import React from 'react'
import { Box, Card, Callout } from '@radix-ui/themes'

/*
  WorkbenchShell: shared layout wrapper for all workbenches

  Props:
  - viewer: ReactNode (required) main viewer area content
  - toolbar: ReactNode (optional) controls shown above viewer
  - status: string | ReactNode (optional) status text
  - error: string | ReactNode (optional) error text rendered as Callout
  - editor: ReactNode (optional) editor area when workbench is open
  - docs: ReactNode (optional) docs helper area when toggled
  - viewerHeight: number (optional) applied height for viewer container

  Notes:
  - This component focuses on visual scaffolding and leaves state (toggle open, busy, etc.) to the caller.
  - Consumers control whether editor/docs are shown by passing nodes or null.
*/
export function WorkbenchShell({
  viewer,
  toolbar = null,
  status = null,
  error = null,
  editor = null,
  docs = null,
  viewerHeight = 420,
}) {
  return (
    <Card variant="ghost">
      <Box p="4" style={{ position: 'relative' }}>
        {/* Toolbar */}
        {toolbar ? (
          <Box mb="3">
            {toolbar}
          </Box>
        ) : null}

        {/* Viewer */}
        <Box
          className="viewer-shell"
          style={{
            position: 'relative',
            width: '100%',
            height: viewerHeight,
            minHeight: 280,
            borderRadius: 8,
            border: '1px solid var(--gray-a6)',
            overflow: 'hidden',
            background: 'var(--color-panel-solid)'
          }}
        >
          {viewer}
        </Box>

        {/* Status / Error */}
        {(status || error) ? (
          <Box mt="3">
            {typeof status === 'string' && status ? (
              <div style={{ color: 'var(--gray-11)', fontSize: 12 }}>{status}</div>
            ) : status}
            {error ? (
              <Box mt="2">
                <Callout.Root color="red">
                  <Callout.Text>{typeof error === 'string' ? error : error}</Callout.Text>
                </Callout.Root>
              </Box>
            ) : null}
          </Box>
        ) : null}

        {/* Editor */}
        {editor ? (
          <Box mt="3">
            {editor}
          </Box>
        ) : null}

        {/* Docs */}
        {docs ? (
          <Box mt="3">
            {docs}
          </Box>
        ) : null}
      </Box>
    </Card>
  )
}
