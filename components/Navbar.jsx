import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { getAssetPath } from '@/lib/paths'
import Image from 'next/image'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-black backdrop-blur">
      <div className="container flex h-20 items-center">
        <div className="mr-4 flex">
          <Link href={getAssetPath('/')} className="mr-6 flex items-center">
            {/* Spoko Logo - Dark variant for black navbar */}
            <div className="h-12 w-auto">
              <Image
                src="/assets/spoko-logo-navbar.svg"
                alt="Spoko Logo"
                width={120}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link
              href={getAssetPath('/test')}
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Test
            </Link>
            <Link
              href={getAssetPath('/docs')}
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Docs
            </Link>
            <Link
              href={getAssetPath('/design')}
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Design
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
