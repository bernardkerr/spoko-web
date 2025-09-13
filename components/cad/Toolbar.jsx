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
  backgroundMode,
  onCycleBackground,
  outlineThreshold,
  onCycleOutlineThreshold,
  outlineScale,
  onCycleOutlineScale,
  edgesMode,
  onCycleEdges,
  outlineColorMode,
  onCycleOutlineColor,
  edgesLineWidth,
  onCycleEdgesLineWidth,
  ambientLevel,
  directionalLevel,
  onCycleAmbientLevel,
  onCycleDirectionalLevel,
  leading,
  children,
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {leading}
      <Button onClick={onCycleAmbientLevel}>
        AMB: {ambientLevel === 0 ? 'OFF' : ambientLevel.toFixed(1)}
      </Button>
      <Button onClick={onCycleDirectionalLevel}>
        DIR: {directionalLevel === 0 ? 'OFF' : directionalLevel.toFixed(1)}
      </Button>
      <Button onClick={onCycleStyle}>
        STYLE: {styleMode || 'BASIC'}
      </Button>
      <Button onClick={onCycleBackground}>
        BACK: {backgroundMode || 'WHITE'}
      </Button>
      <Button onClick={onCycleEdges}>
        EDGES: {edgesMode || 'AUTO'}
      </Button>
      {edgesMode !== 'OFF' && (
        <Button onClick={onCycleOutlineThreshold}>
          EDGE THR: {outlineThreshold}{'\u00B0'}
        </Button>
      )}
      {edgesMode !== 'OFF' && (
        <Button onClick={onCycleEdgesLineWidth}>
          EDGE W: {(Number(edgesLineWidth ?? 2)).toFixed(2)}
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
      {children}
      <Button onClick={onToggleOrigin}>
        ORIGIN: {originVisible ? 'ON' : 'OFF'}
      </Button>
    </div>
  )
}
