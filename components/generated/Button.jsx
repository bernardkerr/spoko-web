"use client"

import { getAssetPath } from '@/lib/paths'

export default function Button({ href = '#', variant = 'primary', children, className = '', ...rest }) {
  const isInternal = typeof href === 'string' && href.startsWith('/')
  const finalHref = isInternal ? getAssetPath(href) : href
  const baseCls = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-6'
  const variants = {
    primary: `${baseCls} bg-primary text-primary-foreground hover:bg-primary/90`,
    secondary: `${baseCls} border border-input bg-background hover:bg-accent hover:text-accent-foreground`,
    link: `${baseCls} bg-transparent underline px-0 h-auto`,
  }
  const cls = `${variants[variant] || variants.primary} ${className}`.trim()
  return (
    <a href={finalHref} className={cls} {...rest}>
      {children}
    </a>
  )
}