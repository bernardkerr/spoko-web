import * as React from 'react'
import { cn } from '@/lib/utils'

const Accordion = ({ className, children }) => (
  <div className={cn('divide-y rounded-md border', className)}>{children}</div>
)

const AccordionItem = ({ className, children }) => (
  <div className={cn('p-0', className)}>{children}</div>
)

const AccordionTrigger = ({ className, children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={cn('cursor-pointer px-4 py-3 text-sm font-medium hover:bg-muted', className)} onClick={() => setOpen((v) => !v)}>
      <div className="flex items-center justify-between">
        <span>{children?.[0] || children}</span>
        <span className={cn('transition-transform', open && 'rotate-90')}>›</span>
      </div>
      {Array.isArray(children) ? children.slice(1).map((c, i) => (
        <div key={i} className={cn('pt-3 text-sm text-muted-foreground', open ? 'block' : 'hidden')}>{c}</div>
      )) : null}
    </div>
  )
}

const AccordionContent = ({ className, children }) => (
  <div className={cn('px-4 pb-4 text-sm text-muted-foreground', className)}>{children}</div>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
