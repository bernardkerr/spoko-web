import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import Image from 'next/image'

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
            <Image
              src="/assets/spoko-logo-navbar.svg"
              alt="Spoko Logo"
              width={120}
              height={36}
              priority
            />
          </Link>
          <nav className="navbar-links">
            <Link href="/docs">Docs</Link>
            <Link href="/test">Test</Link>
          </nav>
        </div>
        <div className="navbar-right">
          <nav>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
