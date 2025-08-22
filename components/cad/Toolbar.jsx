'use client'

import { Button } from '@radix-ui/themes'

export function Toolbar({
  spinMode,
  frameMode,
  shadingMode,
  originVisible,
  onCycleSpin,
  onToggleFrame,
  onToggleShading,
  onToggleOrigin,
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button onClick={onCycleSpin}>
        SPIN: {(spinMode === 'on') ? 'ON' : (spinMode === 'auto') ? 'AUTO' : 'OFF'}
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
