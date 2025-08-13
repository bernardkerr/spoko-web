import * as React from 'react'
import { cn } from '@/lib/utils'

const HoverCard = ({ className, children }) => (
  <div className={cn('relative inline-block', className)}>{children}</div>
)

const HoverCardTrigger = ({ asChild, children }) => (asChild ? children : <span>{children}</span>)

const HoverCardContent = ({ className, children }) => (
  <div className={cn('absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-md border bg-popover p-3 text-popover-foreground shadow opacity-0 transition-opacity group-hover:opacity-100', className)}>
    {children}
  </div>
)

export { HoverCard, HoverCardTrigger, HoverCardContent }
