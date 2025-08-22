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
  styleMode,
  onCycleStyle,
  outlineThreshold,
  onCycleOutlineThreshold,
  outlineScale,
  onCycleOutlineScale,
  edgesMode,
  onCycleEdges,
  outlineColorMode,
  onCycleOutlineColor,
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button onClick={onCycleStyle}>
        STYLE: {styleMode || 'BASIC'}
      </Button>
      <Button onClick={onCycleEdges}>
        EDGES: {edgesMode || 'AUTO'}
      </Button>
      {edgesMode !== 'OFF' && (
        <Button onClick={onCycleOutlineThreshold}>
          EDGE THR: {outlineThreshold}{'\u00B0'}
        </Button>
      )}
      {(styleMode === 'OUTLINE' || styleMode === 'TOON') && (
        <>
          <Button onClick={onCycleOutlineColor}>
            OUTLINE COL: {outlineColorMode || 'AUTO'}
          </Button>
          <Button onClick={onCycleOutlineScale}>
            OUTLINE: {outlineScale?.toFixed ? outlineScale.toFixed(3) : outlineScale}x
          </Button>
        </>
      )}
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
