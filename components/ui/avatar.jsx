import * as React from 'react'
import { cn } from '@/lib/utils'

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const Avatar = ({ className, name = 'User', src, alt, fallback, size = 40 }) => {
  const initials = fallback || getInitials(name)
  return (
    <div
      className={cn(
        'inline-flex select-none items-center justify-center rounded-full bg-muted text-foreground/80',
        'border border-border',
        className
      )}
      style={{ width: size, height: size }}
      aria-label={name}
      role="img"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium">{initials}</span>
      )}
    </div>
  )
}

export { Avatar }
