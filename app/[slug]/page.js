import { Section, Box, Heading, Text } from '@radix-ui/themes'
import { Mdx } from '@/lib/mdx'
import { Mermaid } from '@/components/Mermaid'
import MDXImage from '@/components/MDXImage'
import { getTopLevelContentSlugs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import FloatingTOC from '@/components/FloatingTOC'

export async function generateStaticParams() {
  const slugs = await getTopLevelContentSlugs()
  return slugs
}

export default async function TopLevelContentPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // In development, disable caching so markdown edits reflect immediately
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
  }

  try {
    // Read the content file from content directory
    const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`)
    let fileContents
    
    // Try .mdx first, then .md
    if (fs.existsSync(filePath)) {
      fileContents = fs.readFileSync(filePath, 'utf8')
    } else {
      const mdPath = path.join(process.cwd(), 'content', `${slug}.md`)
      if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, 'utf8')
      } else {
        notFound()
      }
    }

    const { data: frontmatter, content } = matter(fileContents)

    // Derive page title from frontmatter or slug
    const pageTitle = frontmatter.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return (
      <>
        <Section size="4">
          <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
            <Box mb="5">
              <Heading size="9">
                {pageTitle}
              </Heading>
              {frontmatter.description && (
                <Text as="p" color="gray" size="4">{frontmatter.description}</Text>
              )}
            </Box>
            
            <div className="prose dark:prose-invert max-w-none">
              <Mdx
                source={content}
                layout={frontmatter.layout}
                components={{
                  img: (imgProps) => (
                    <MDXImage
                      {...imgProps}
                      originPath={`/${slug}`}
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
  } catch (error) {
    console.error(`Error loading content for slug "${slug}":`, error)
    notFound()
  }
}
