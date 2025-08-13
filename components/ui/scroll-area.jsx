import * as React from 'react'
import { cn } from '@/lib/utils'

const ScrollArea = ({ className, children, style, ...props }) => {
  return (
    <div className={cn('relative overflow-hidden rounded-md border', className)} style={style} {...props}>
      <div className="h-full w-full overflow-auto [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground))_transparent]">
        {children}
      </div>
    </div>
  )
}

export { ScrollArea }
