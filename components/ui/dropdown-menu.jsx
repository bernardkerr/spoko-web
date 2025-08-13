import * as React from 'react'
import { cn } from '@/lib/utils'

const DropdownMenu = ({ className, children }) => (
  <div className={cn('relative inline-block text-left', className)}>{children}</div>
)

const DropdownMenuTrigger = ({ asChild, children, ...props }) => (asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>)

const DropdownMenuContent = ({ open, align = 'start', className, children }) => (
  <div
    className={cn(
      'absolute z-20 mt-2 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow',
      open ? 'block' : 'hidden',
      align === 'end' ? 'right-0' : 'left-0',
      className
    )}
  >
    {children}
  </div>
)

const DropdownMenuItem = ({ className, children, onSelect }) => (
  <button
    className={cn('flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted', className)}
    onClick={onSelect}
    role="menuitem"
  >
    {children}
  </button>
)

function useDropdownMenu() {
  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)
  return { open, toggle, close }
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, useDropdownMenu }
