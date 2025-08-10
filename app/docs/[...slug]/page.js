import { notFound } from 'next/navigation'
import { getMarkdownContent, getAllMarkdownSlugs } from '@/lib/markdown'
import { Mermaid } from '@/components/Mermaid'
import { getImagePath } from '@/lib/paths'

// Component to handle Mermaid diagrams in rendered HTML
function MermaidRenderer({ html }) {
  // Use a more robust approach to find and replace Mermaid diagrams
  const parts = []
  let lastIndex = 0
  
  // Find all mermaid wrapper divs
  const mermaidRegex = /<div class="mermaid-wrapper"><div class="mermaid" data-mermaid="([^"]*)"><\/div><\/div>/g
  let match
  
  while ((match = mermaidRegex.exec(html)) !== null) {
    // Add HTML content before this mermaid diagram
    if (match.index > lastIndex) {
      const htmlPart = html.substring(lastIndex, match.index)
      if (htmlPart.trim()) {
        parts.push(
          <div 
            key={`html-${parts.length}`}
            dangerouslySetInnerHTML={{ __html: htmlPart }}
          />
        )
      }
    }
    
    // Add the Mermaid component
    const code = match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    parts.push(
      <Mermaid key={`mermaid-${parts.length}`} code={code} />
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add any remaining HTML content
  if (lastIndex < html.length) {
    const remainingHtml = html.substring(lastIndex)
    if (remainingHtml.trim()) {
      parts.push(
        <div 
          key={`html-${parts.length}`}
          dangerouslySetInnerHTML={{ __html: remainingHtml }}
        />
      )
    }
  }
  
  // If no mermaid diagrams found, just render the HTML
  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }
  
  return <>{parts}</>
}

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugs()
  return slugs
}

export default async function DocPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  const doc = await getMarkdownContent(slug)
  
  if (!doc) {
    notFound()
  }

  // Process images in the HTML to use correct paths
  let processedContent = doc.content
  
  // Handle absolute paths that include content-submodule
  processedContent = processedContent.replace(
    /src="([^"]*\/content-submodule\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )
  
  // Handle relative paths from markdown (e.g., images/diagram.png)
  processedContent = processedContent.replace(
    /src="((?!http|\/)images\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(`/content-submodule/${src}`)}"`
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
