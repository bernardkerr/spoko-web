import * as React from 'react'
import { cn } from '@/lib/utils'

const AlertDialog = ({ children }) => <div className="inline-block">{children}</div>

const AlertDialogTrigger = ({ asChild, children, ...props }) => (asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>)

const AlertDialogContent = ({ open, className, children }) => (
  <div
    className={cn(
      'fixed inset-0 z-40 grid place-items-center bg-black/40 p-4',
      open ? 'visible' : 'invisible'
    )}
  >
    <div className={cn('w-full max-w-sm rounded-lg border bg-background p-4 text-foreground shadow-lg', className)}>
      {children}
    </div>
  </div>
)

const AlertDialogHeader = ({ children }) => <div className="mb-2">{children}</div>
const AlertDialogTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>
const AlertDialogDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>
const AlertDialogFooter = ({ children }) => <div className="mt-4 flex justify-end gap-2">{children}</div>

function useAlertDialog() {
  const [open, setOpen] = React.useState(false)
  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)
  return { open, openDialog, closeDialog }
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  useAlertDialog,
}
