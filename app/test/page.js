import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssetPath } from '@/lib/paths'

export default function TestPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Test
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            All content that previously appeared on the front page now lives here.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full max-w-7xl">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Three.js Examples</CardTitle>
              <CardDescription>
                Interactive 3D graphics and animations powered by Three.js and React Three Fiber.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={getAssetPath('/three')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Examples
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Mermaid Diagrams</CardTitle>
              <CardDescription>
                Beautiful diagrams and flowcharts with site-themed Mermaid integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={getAssetPath('/mermaid')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Diagrams
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Markdown-based documentation with support for Git submodules and rich typography.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={getAssetPath('/docs')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Read Docs
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Figma Design System</CardTitle>
              <CardDescription>
                Design token synchronization and component generation from Figma designs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={getAssetPath('/figma')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Design System
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Figma Design</CardTitle>
              <CardDescription>
                Your complete Figma design rendered as an interactive web interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={getAssetPath('/design')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Design
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
