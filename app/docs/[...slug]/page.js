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

export async function generateStaticParams() {
  const slugs = await getAllMarkdownSlugsFromRoots(['docs-submodules'])
  return slugs
}

export default async function DocPage({ params }) {
  const resolvedParams = await params
  const slugSegments = resolvedParams.slug
  const slug = slugSegments.join('/')

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
