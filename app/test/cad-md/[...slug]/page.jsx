import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'
import { getMarkdownFilesFromRoots } from '@/lib/markdown'
import { Mdx } from '@/lib/mdx'
import { Section, Box, Heading, Text } from '@radix-ui/themes'

export async function generateStaticParams() {
  const files = await getMarkdownFilesFromRoots(['docs-test'])
  return files.map(f => ({ slug: f.slug.split('/') }))
}

function readMarkdownFromDocsTest(slugParts) {
  const rel = slugParts.join('/') + '.md'
  const abs = path.join(process.cwd(), 'docs-test', rel)
  if (!fs.existsSync(abs)) return null
  return fs.readFileSync(abs, 'utf8')
}

export default async function CadMdDocPage({ params }) {
  const resolved = await params
  const slugParts = resolved.slug
  const md = readMarkdownFromDocsTest(slugParts)
  if (md == null) {
    notFound()
  }

  // Parse frontmatter and strip it from MDX source
  const { data: fm, content } = matter(md)

  // Derive page title: prefer frontmatter.title, else first H1, else filename
  const firstH1 = content.match(/^#\s+(.+)$/m)
  const fallbackTitle = slugParts[slugParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const pageTitle = (fm && fm.title) ? String(fm.title) : (firstH1 ? firstH1[1].trim() : fallbackTitle)

  // Determine layout/renderer
  const layout = (fm && (fm.layout || fm.renderer)) || undefined

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">{pageTitle}</Heading>
          <Text as="p" color="gray" size="4">
            Markdown rendered via MDX. <code>js cad</code> code fences are interactive (back-compat for <code>cadjs</code> is supported).
          </Text>
        </Box>
        <article className="prose dark:prose-invert max-w-none">
          <Mdx source={content} layout={layout} />
        </article>
      </Box>
    </Section>
  )
}
