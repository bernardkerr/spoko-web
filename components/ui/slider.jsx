import * as React from 'react'
import { cn } from '@/lib/utils'

const Slider = ({ className, value, defaultValue = 50, onChange, min = 0, max = 100, step = 1 }) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const val = value ?? internal
  const handle = (e) => {
    const v = Number(e.target.value)
    setInternal(v)
    onChange?.(v)
  }
  return (
    <div className={cn('w-full select-none', className)}>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${((val - min) / (max - min)) * 100}%` }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={handle}
        className="mt-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
      />
    </div>
  )
}

export { Slider }
