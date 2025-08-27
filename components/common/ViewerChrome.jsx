'use client'

import React from 'react'
import { Button } from '@radix-ui/themes'
import { Wrench, Eye } from 'lucide-react'

// Small overlay control to toggle workbench visibility from inside the viewer
// Props:
// - visible: boolean
// - onOpen: () => void
// - onClose: () => void
// - style: optional inline style overrides for positioning
export function ViewerChrome({ visible, onOpen, onClose, style }) {
  const baseStyle = {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.9,
    padding: 6,
    minWidth: 0,
    zIndex: 3,
    ...style,
  }
  return (
    <Button
      size="1"
      variant="ghost"
      onClick={visible ? onClose : onOpen}
      style={baseStyle}
      aria-label={visible ? 'Viewer only' : 'Open workbench'}
      title={visible ? 'Viewer only' : 'Open workbench'}
    >
      {visible ? <Eye width={28} height={28} strokeWidth={2} /> : <Wrench width={28} height={28} strokeWidth={2} />}
    </Button>
  )
}
