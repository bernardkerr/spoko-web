import Link from 'next/link'
import { getAssetPath } from '@/lib/paths'

export default function Home() {
  return (
    <main className="container py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tighter mb-4">Welcome to Spoko</h1>
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">A modern design system and development toolkit.</p>
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={getAssetPath('/test')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
        >
          Go to Test
        </Link>
        <Link
          href={getAssetPath('/docs')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
        >
          View Documentation
        </Link>
      </div>
    </main>
  )
}
