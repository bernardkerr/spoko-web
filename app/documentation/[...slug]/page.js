import { notFound } from 'next/navigation'
import {
  getMarkdownContentFromRoots,
  getAllMarkdownSlugsFromRoots,
  getMarkdownFrontmatterFromRoots,
} from '@/lib/markdown'
import { getImagePath } from '@/lib/paths'
import { Mermaid } from '@/components/Mermaid'
import { Section, Box, Heading, Text } from '@radix-ui/themes'
import SideImagesDoc from '@/components/templates/SideImagesDoc'
import FloatingTOC from '@/components/FloatingTOC'
import { extractAndMaybeRemoveFirstH1FromHtml } from '@/lib/title'

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugsFromRoots(['docs-submodules'])
  return slugs
}

export default async function DocumentationPage({ params }) {
  const resolvedParams = await params
  const slugSegments = resolvedParams.slug
  const slug = slugSegments.join('/')

  // In development, disable caching so markdown edits reflect immediately
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
  }

  // Peek at frontmatter to decide renderer/layout early
  const fm = await getMarkdownFrontmatterFromRoots(slug, ['docs-submodules'])

  const doc = await getMarkdownContentFromRoots(slug, ['docs-submodules'])
  if (!doc) {
    notFound()
  }

  // Start from the HTML returned by markdown processor
  let html = doc.content

  // Use shared utility to dedupe/remove first H1 against frontmatter title
  const { html: bodyHtml, title: derivedTitle } = extractAndMaybeRemoveFirstH1FromHtml(
    html,
    doc.frontmatter.title
  )

  // Derive page title: prefer frontmatter or first H1 text, then slug fallback
  let pageTitle = derivedTitle
  if (!pageTitle) {
    pageTitle = slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Process images in the HTML to use correct paths
  let processedContent = bodyHtml

  // Handle absolute paths that include docs-test or docs-submodules
  processedContent = processedContent.replace(
    /src="([^"]*\/(docs-test|docs-submodules)\/[^\"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )

  // Handle absolute paths starting with /images/
  processedContent = processedContent.replace(
    /src="(\/images\/[^"]*)"/g,
    (match, src) => `src="${getImagePath(src)}"`
  )

  // Handle relative paths from markdown (e.g., images/diagram.png)
  processedContent = processedContent.replace(
    /src=\"((?!http|\/)images\/[^"]*)\"/g,
    (match, src) => `src=\"${getImagePath(src)}\"`
  )

  // If sideImages renderer/layout is specified, use alternate template
  const wantsSideImages =
    (fm && fm.frontmatter && (fm.frontmatter.renderer === 'sideImages' || fm.frontmatter.layout === 'sideImages')) ||
    (doc.frontmatter && (doc.frontmatter.renderer === 'sideImages' || doc.frontmatter.layout === 'sideImages'))

  if (wantsSideImages) {
    const originPath = `/documentation/${slug}`
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
            <Heading size="9">{pageTitle}</Heading>
            {doc.frontmatter.description && (
              <Text as="p" color="gray" size="4">
                {doc.frontmatter.description}
              </Text>
            )}
          </Box>

          <article
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          <Mermaid autoRender={true} />
        </Box>
      </Section>
      <FloatingTOC />
    </>
  )
}
