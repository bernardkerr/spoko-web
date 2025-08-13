import * as React from 'react'
import { cn } from '@/lib/utils'

const RadioGroup = ({ className, name, children, ...props }) => (
  <div className={cn('space-y-2', className)} role="radiogroup" {...props}>
    {React.Children.map(children, (child) => React.cloneElement(child, { name }))}
  </div>
)

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="radio"
    ref={ref}
    className={cn(
      'h-4 w-4 rounded-full border-input text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
