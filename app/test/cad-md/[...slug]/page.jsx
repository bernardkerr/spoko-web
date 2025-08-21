import fs from 'fs'
import path from 'path'
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

  // Derive page title from first H1 or filename
  const firstH1 = md.match(/^#\s+(.+)$/m)
  const pageTitle = firstH1 ? firstH1[1].trim() : slugParts[slugParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">{pageTitle}</Heading>
          <Text as="p" color="gray" size="4">
            Markdown rendered via MDX. <code>cadjs</code> code fences are interactive.
          </Text>
        </Box>
        <article className="prose dark:prose-invert max-w-none">
          <Mdx source={md} />
        </article>
      </Box>
    </Section>
  )
}
