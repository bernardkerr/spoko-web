import { notFound } from 'next/navigation'
import { getAllMarkdownSlugsFromRoots } from '@/lib/markdown'
import { Section, Box, Heading, Text } from '@radix-ui/themes'
import { Mdx } from '@/lib/mdx'
import MDXImage from '@/components/MDXImage'
import { Mermaid } from '@/components/Mermaid'
import FloatingTOC from '@/components/FloatingTOC'
import { extractAndMaybeRemoveFirstH1FromMdxSource } from '@/lib/title'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { CONTENT_VERSION } from '@/lib/content-version'

// Explicitly mark this catch-all route as fully static for export
export const dynamicParams = false
export const dynamic = 'error'

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugsFromRoots(['docs-submodules'])
  try {
    console.log('[build] /docs/[...slug] generateStaticParams count =', Array.isArray(slugs) ? slugs.length : 'n/a')
    if (Array.isArray(slugs)) {
      const sample = slugs.slice(0, 5)
      console.log('[build] sample params:', JSON.stringify(sample))
    }
  } catch {}
  if (!Array.isArray(slugs) || slugs.length === 0) {
    // Provide a placeholder route so export can succeed even when submodules are missing
    return [{ slug: ['_placeholder'] }]
  }
  return slugs
}

export default async function DocPage({ params }) {
  const resolvedParams = await params
  const slugSegments = resolvedParams.slug
  const slug = slugSegments.join('/')

  // Render a static placeholder page when docs are not available during export
  if (slug === '_placeholder') {
    const title = 'Documentation Not Available'
    return (
      <>
        <Section size="4">
          <Box className="container" data-content-version={CONTENT_VERSION}>
            <Box mb="5">
              <Heading size="9">{title}</Heading>
              <Text as="p" color="gray" size="4">
                Git submodules under <code>docs-submodules/</code> are not initialized. This placeholder exists so static export can succeed.
              </Text>
              <Box mt="3">
                <Text as="p" size="3">
                  To enable documentation pages locally:
                </Text>
                <pre className="mt-2"><code>git submodule update --init --recursive</code></pre>
              </Box>
            </Box>
          </Box>
        </Section>
        <FloatingTOC />
      </>
    )
  }

  // In development, disable caching so markdown edits reflect immediately
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
  }

  // Resolve file inside docs-submodules/, support both .mdx and .md
  const mdxPath = path.join(process.cwd(), 'docs-submodules', `${slug}.mdx`)
  const mdPath = path.join(process.cwd(), 'docs-submodules', `${slug}.md`)
  let filePath = ''
  if (fs.existsSync(mdxPath)) filePath = mdxPath
  else if (fs.existsSync(mdPath)) filePath = mdPath
  else {
    notFound()
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data: frontmatter, content } = matter(fileContents)

  // Remove first H1 if it duplicates the title
  const { source: cleanedSource, title: derivedTitle } = extractAndMaybeRemoveFirstH1FromMdxSource(
    content,
    frontmatter.title
  )

  // Derive page title
  const pageTitle = derivedTitle || slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <>
      <Section size="4">
        <Box className="container" data-content-version={CONTENT_VERSION}>
          <Box mb="5">
            <Heading size="9">{pageTitle}</Heading>
            {frontmatter.description && (
              <Text as="p" color="gray" size="4">
                {frontmatter.description}
              </Text>
            )}
          </Box>

          <div className="prose dark:prose-invert max-w-none">
            <Mdx
              source={cleanedSource}
              layout={frontmatter.layout || frontmatter.renderer}
              components={{
                img: (imgProps) => (
                  <MDXImage
                    {...imgProps}
                    originPath={`/docs/${slug}`}
                    backLabel={pageTitle}
                  />
                ),
              }}
            />
          </div>
          <Mermaid autoRender={true} />
        </Box>
      </Section>
      <FloatingTOC />
    </>
  )
}
