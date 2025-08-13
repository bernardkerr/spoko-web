import * as React from 'react'
import { cn } from '@/lib/utils'

const Popover = ({ children, className }) => (
  <div className={cn('relative inline-block', className)}>{children}</div>
)

const PopoverTrigger = ({ asChild, children, ...props }) => {
  return asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>
}

const PopoverContent = ({ open, side = 'bottom', align = 'center', className, children }) => {
  return (
    <div
      className={cn(
        'absolute z-20 min-w-[200px] rounded-md border bg-popover p-3 text-popover-foreground shadow',
        open ? 'block' : 'hidden',
        side === 'bottom' && 'left-1/2 top-full -translate-x-1/2 mt-2',
        side === 'top' && 'left-1/2 bottom-full -translate-x-1/2 mb-2',
        side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
        side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
        className
      )}
    >
      {children}
    </div>
  )
}

function usePopover() {
  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)
  return { open, toggle, close }
}

export { Popover, PopoverTrigger, PopoverContent, usePopover }
