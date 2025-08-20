import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import Image from 'next/image'
import { getTopLevelContentFiles } from '@/lib/markdown'

export async function Navbar() {
  // Get top-level content files for dynamic navigation
  const topLevelPages = await getTopLevelContentFiles()

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/spoko-logo-outline.svg`}
              alt="Spoko Logo"
              width={96}
              height={36}
              priority
            />
          </Link>
          <nav className="navbar-links">
            {/* Dynamic content pages */}
            {topLevelPages.map(page => (
              <Link key={page.slug} href={`/${page.slug}`}>
                {page.title}
              </Link>
            ))}
            
            {/* Static navigation items */}
            <Link href="/documentation">Documentation</Link>
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
