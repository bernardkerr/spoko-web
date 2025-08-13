import * as React from 'react'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef(({ className, checked, defaultChecked, ...props }, ref) => (
  <label className={cn('relative inline-flex h-6 w-10 items-center', className)}>
    <input
      type="checkbox"
      className="peer sr-only"
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      {...props}
    />
    <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
    <span className="relative left-0 h-5 w-5 translate-x-0 rounded-full bg-background shadow transition-transform peer-checked:translate-x-4" />
  </label>
))
Switch.displayName = 'Switch'

export { Switch }
