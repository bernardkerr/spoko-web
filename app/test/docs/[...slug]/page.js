import { notFound } from 'next/navigation'
import { 
  getMarkdownContentFromRoots, 
  getAllMarkdownSlugsFromRoots, 
  getMarkdownFrontmatterFromRoots 
} from '@/lib/markdown'
import { getImagePath } from '@/lib/paths'
import { Mermaid } from '@/components/Mermaid'
import { Section, Box, Heading, Text } from '@radix-ui/themes'
import SideImagesDoc from '@/components/templates/SideImagesDoc'
import FloatingTOC from '@/components/FloatingTOC'

// Mermaid diagrams are now pre-rendered to inline SVG by lib/markdown.js.

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugsFromRoots(['docs-test'])
  return slugs
}

export default async function DocPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')

  // Peek at frontmatter to decide renderer/layout early
  const fm = await getMarkdownFrontmatterFromRoots(slug, ['docs-test'])

  const doc = await getMarkdownContentFromRoots(slug, ['docs-test'])
  
  if (!doc) {
    notFound()
  }

  // Start from the HTML returned by markdown processor
  let html = doc.content

  // Find the first H1 (if any) to possibly use as title and remove from body
  const firstH1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const firstH1Text = firstH1Match ? firstH1Match[1].replace(/<[^>]+>/g, '').trim() : undefined
  if (firstH1Match) {
    // Remove only the first H1 from the HTML body
    html = html.replace(firstH1Match[0], '')
  }

  // Derive page title: prefer frontmatter, then first H1 text, then slug fallback
  let pageTitle = doc.frontmatter.title || firstH1Text
  if (!pageTitle) {
    pageTitle = slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Process images in the HTML to use correct paths
  let processedContent = html
  
  // Handle absolute paths that include docs-test or docs-submodules
  processedContent = processedContent.replace(
    /src="([^"]*\/(docs-test|docs-submodules)\/[^"]*)"/g,
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

  // If sideImages renderer/layout is specified, use alternate template
  const wantsSideImages =
    (fm && fm.frontmatter && (fm.frontmatter.renderer === 'sideImages' || fm.frontmatter.layout === 'sideImages')) ||
    (doc.frontmatter && (doc.frontmatter.renderer === 'sideImages' || doc.frontmatter.layout === 'sideImages'))

  if (wantsSideImages) {
    const originPath = `/test/docs/${slug}`
    return (
      <SideImagesDoc
        title={pageTitle}
        description={doc.frontmatter.description}
        html={processedContent}
        originPath={originPath}
      />
    )
  }

  return (
    <>
      <Section size="4">
        <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
          <Box mb="5">
            <Heading size="9">
              {pageTitle}
            </Heading>
            {doc.frontmatter.description && (
              <Text as="p" color="gray" size="4">{doc.frontmatter.description}</Text>
            )}
          </Box>

          <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: processedContent }} />
          <Mermaid autoRender={true} />
        </Box>
      </Section>
      <FloatingTOC />
    </>
  )
}
