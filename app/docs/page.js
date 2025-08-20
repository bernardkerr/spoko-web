import NextLink from 'next/link'
import { getMarkdownFilesFromRoots } from '@/lib/markdown'
import DocCard from '@/components/DocCard'
import {
  Section,
  Box,
  Heading,
  Text,
  Grid,
  Card,
  Button,
  Code,
} from '@radix-ui/themes'

export default async function DocsIndexPage() {
  const files = await getMarkdownFilesFromRoots(['docs-submodules'])

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Docs</Heading>
          <Text as="p" color="gray" size="4">
            Documentation from Git submodules mounted under <Code>docs-submodules/</Code>.
          </Text>
        </Box>

        {files.length === 0 ? (
          <DocCard>
            <Heading size="4" mb="2">No Documentation Found</Heading>
            <Text as="p" color="gray" size="3" mb="3">
              Add a docs repository as a Git submodule in <Code>docs-submodules/</Code>.
            </Text>
            <div className="prose dark:prose-invert">
              <p>Example command:</p>
              <pre><code>git submodule add https://github.com/your-username/your-docs-repo.git docs-submodules/your-docs-repo</code></pre>
            </div>
          </DocCard>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {files.map((file) => (
              <DocCard key={file.slug}>
                <Heading size="4" mb="1">
                  <NextLink href={`/docs/${file.slug}`}>
                    {file.slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </NextLink>
                </Heading>
                <Text color="gray" size="2">Path: {file.slug}</Text>
              </DocCard>
            ))}
          </Grid>
        )}
      </Box>
    </Section>
  )
}
