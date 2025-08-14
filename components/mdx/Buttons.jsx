import { getBasePath } from '@/lib/paths'

export function Buttons({ children }) {
  return (
    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
      {children}
    </div>
  )
}

export function Button({ href = '#', variant = 'primary', children }) {
  const base = getBasePath()
  const isInternal = href?.startsWith('/')
  const finalHref = isInternal && base ? `${base}${href}` : href
  const btnBase =
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-6'
  const variants =
    variant === 'secondary'
      ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      : 'bg-primary text-primary-foreground hover:bg-primary/90'
  return (
    <a href={finalHref} className={`${btnBase} ${variants}`}>
      {children}
    </a>
  )
}
