import { notFound } from 'next/navigation'
import { getMarkdownContent, getAllMarkdownSlugs } from '@/lib/markdown'
import { getImagePath } from '@/lib/paths'
import MermaidAutoRender from '@/components/MermaidAutoRender'
import { Section, Box, Heading, Text } from '@radix-ui/themes'

// Mermaid diagrams are now pre-rendered to inline SVG by lib/markdown.js.

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
  
  // Handle absolute paths starting with /images/
  processedContent = processedContent.replace(
    /src="(\/images\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )

  // Handle relative paths from markdown (e.g., images/diagram.png)
  processedContent = processedContent.replace(
    /src="((?!http|\/)images\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">
            {doc.frontmatter.title || slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Heading>
          {doc.frontmatter.description && (
            <Text as="p" color="gray" size="4">{doc.frontmatter.description}</Text>
          )}
        </Box>

        <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: processedContent }} />
        <MermaidAutoRender />
      </Box>
    </Section>
  )
}
