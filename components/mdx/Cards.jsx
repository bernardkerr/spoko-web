export function Cards({ children }) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      {children}
    </div>
  )
}

export function Card({ children }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {children}
    </div>
  )
}

export function CardHeader({ children }) {
  return (
    <div className="flex flex-col space-y-1.5 p-6">
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return (
    <h3 className="text-2xl font-semibold leading-none tracking-tight">
      {children}
    </h3>
  )
}

export function CardDescription({ children }) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  )
}
