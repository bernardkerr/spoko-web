import { notFound } from 'next/navigation'
import { getMarkdownContent, getAllMarkdownSlugs } from '@/lib/markdown'
import { Mermaid } from '@/components/Mermaid'
import { getImagePath } from '@/lib/paths'

// Component to handle Mermaid diagrams in rendered HTML
function MermaidRenderer({ html }) {
  // Extract mermaid diagrams and render them separately
  const parts = html.split(/<div class="mermaid-wrapper">.*?<\/div>/g)
  const mermaidMatches = html.match(/<div class="mermaid"[^>]*data-mermaid="([^"]*)"[^>]*><\/div>/g) || []
  
  const elements = []
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      elements.push(
        <div 
          key={`html-${i}`}
          dangerouslySetInnerHTML={{ __html: parts[i] }}
        />
      )
    }
    
    if (mermaidMatches[i]) {
      const match = mermaidMatches[i].match(/data-mermaid="([^"]*)"/)
      if (match) {
        const code = match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        elements.push(
          <Mermaid key={`mermaid-${i}`} code={code} />
        )
      }
    }
  }
  
  return <>{elements}</>
}

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugs()
  return slugs
}

export default async function DocPage({ params }) {
  const slug = params.slug.join('/')
  const doc = await getMarkdownContent(slug)
  
  if (!doc) {
    notFound()
  }

  // Process images in the HTML to use correct paths
  let processedContent = doc.content
  processedContent = processedContent.replace(
    /src="([^"]*\/content-submodule\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {doc.frontmatter.title || 
             slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
          {doc.frontmatter.description && (
            <p className="text-muted-foreground text-lg">
              {doc.frontmatter.description}
            </p>
          )}
        </div>

        <article className="prose dark:prose-invert max-w-none">
          <MermaidRenderer html={processedContent} />
        </article>
      </div>
    </div>
  )
}
