import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { getAssetPath } from '@/lib/paths'
import Image from 'next/image'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-black backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href={getAssetPath('/')} className="mr-6 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Spoko Icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                  <g fill="white">
                    {/* Center circle */}
                    <circle cx="25" cy="25" r="3"/>
                    {/* Six petals */}
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z"/>
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z" transform="rotate(60 25 25)"/>
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z" transform="rotate(120 25 25)"/>
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z" transform="rotate(180 25 25)"/>
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z" transform="rotate(240 25 25)"/>
                    <path d="M 25 8 C 22 8, 20 12, 22 16 C 24 18, 26 18, 28 16 C 30 12, 28 8, 25 8 Z" transform="rotate(300 25 25)"/>
                  </g>
                </svg>
              </div>
              {/* Vertical separator */}
              <div className="w-px h-6 bg-white"></div>
              {/* Spoko text */}
              <span className="font-bold text-white text-lg tracking-tight">
                spoko
              </span>
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
