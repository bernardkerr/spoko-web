import Link from 'next/link'
import { getMarkdownFiles } from '@/lib/markdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssetPath } from '@/lib/paths'

export default async function DocsPage() {
  const files = await getMarkdownFiles()

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Browse our documentation powered by Markdown files from Git submodules.
          </p>
        </div>

        {files.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Documentation Found</CardTitle>
              <CardDescription>
                Documentation files should be placed in the <code>content-submodule</code> directory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert">
                <p>To add documentation:</p>
                <ol>
                  <li>Add your content repository as a Git submodule in <code>content-submodule/</code></li>
                  <li>Place your <code>.md</code> files in the submodule</li>
                  <li>Include any images in an <code>images/</code> subdirectory</li>
                  <li>Rebuild the site to see your documentation</li>
                </ol>
                <p>Example command to add a submodule:</p>
                <pre><code>git submodule add https://github.com/your-username/your-docs-repo.git content-submodule</code></pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file.slug} className="transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle>
                    <Link 
                      href={getAssetPath(`/docs/${file.slug}`)}
                      className="hover:underline"
                    >
                      {file.slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Path: {file.slug}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <h2>Documentation Features</h2>
          <p>
            Our documentation system supports:
          </p>
          <ul>
            <li><strong>Git Submodules:</strong> Keep documentation separate from your main codebase</li>
            <li><strong>Frontmatter:</strong> YAML metadata for titles and descriptions</li>
            <li><strong>GitHub Flavored Markdown:</strong> Tables, task lists, and more</li>
            <li><strong>Automatic Mermaid:</strong> Diagrams in <code>```mermaid</code> blocks</li>
            <li><strong>Image Support:</strong> Relative paths work with basePath</li>
            <li><strong>Typography:</strong> Beautiful styling with Tailwind Typography</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
