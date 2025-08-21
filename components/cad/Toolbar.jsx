'use client'

import { Button } from '@radix-ui/themes'

export function Toolbar({
  spinEnabled,
  frameMode,
  shadingMode,
  originVisible,
  onToggleSpin,
  onToggleFrame,
  onToggleShading,
  onToggleOrigin,
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button onClick={onToggleSpin}>
        {spinEnabled ? 'SPIN: ON' : 'SPIN: OFF'}
      </Button>
      <Button onClick={onToggleFrame}>
        FRAME: {frameMode}
      </Button>
      <Button onClick={onToggleShading}>
        SHADING: {shadingMode}
      </Button>
      <Button onClick={onToggleOrigin}>
        ORIGIN: {originVisible ? 'ON' : 'OFF'}
      </Button>
    </div>
  )
}
