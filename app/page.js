import Link from 'next/link'
import { getAssetPath } from '@/lib/paths'

export default function Home() {
  return (
    <main className="container py-16 text-center">
      <h1 className="text-5xl font-bold tracking-tighter">SPOKO</h1>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Welcome.</p>
      <div className="mt-8">
        <Link
          href={getAssetPath('/test')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
        >
          Go to Test
        </Link>
      </div>
    </main>
  )
}
