import * as React from 'react'
import { cn } from '@/lib/utils'

const Tooltip = ({ children, content, side = 'top', className }) => {
  return (
    <span className={cn('relative inline-block group', className)}>
      {children}
      {content ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow transition-opacity',
            'group-hover:opacity-100',
            side === 'top' && 'left-1/2 -translate-x-1/2 -translate-y-2 bottom-full',
            side === 'bottom' && 'left-1/2 -translate-x-1/2 translate-y-2 top-full',
            side === 'left' && 'right-full -translate-y-1/2 -translate-x-2 top-1/2',
            side === 'right' && 'left-full -translate-y-1/2 translate-x-2 top-1/2'
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}

export { Tooltip }
