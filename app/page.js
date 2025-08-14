import Link from 'next/link'
import { getAssetPath } from '@/lib/paths'
import ClientHomeContent from '@/components/ClientHomeContent'
// Note: Using static export. Avoid force-dynamic/noStore to keep compatibility.

export default async function Home() {
  // In development, disable caching so markdown edits reflect immediately.
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
    const { headers } = await import('next/headers')
    headers() // trigger dynamic rendering in dev
  }
  try {
    // Render MDX as first-class module for proper HMR
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Home] rendering MDX module: Home')
    }
    return (
      <main className="container py-16">
        <article className="prose prose-lg dark:prose-invert mx-auto">
          <ClientHomeContent />
        </article>
      </main>
    )
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Home] markdown render error:', e)
    }
    // fall through to JSX fallback
  }

  // Fallback to existing hard-coded content
  return (
    <main className="container py-16 text-center">
      {process.env.NODE_ENV !== 'production' && (
        <div className="text-xs text-gray-500 mb-2">[Dev] Fallback homepage JSX</div>
      )}
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
