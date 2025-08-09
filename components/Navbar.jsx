import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { getAssetPath } from '@/lib/paths'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={getAssetPath('/')} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Next.js Static Site
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href={getAssetPath('/')}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            <Link
              href={getAssetPath('/three')}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Three.js
            </Link>
            <Link
              href={getAssetPath('/mermaid')}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Mermaid
            </Link>
            <Link
              href={getAssetPath('/docs')}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Docs
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu could go here */}
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
