import NextLink from 'next/link'
import { getMarkdownFilesFromRoots } from '@/lib/markdown'
import DocCard from '@/components/DocCard'
import { Section, Box, Heading, Text, Grid, Code } from '@radix-ui/themes'

export default async function CadMdIndexPage() {
  const files = await getMarkdownFilesFromRoots(['docs-test'])

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">CAD in Markdown</Heading>
          <Text as="p" color="gray" size="4">
            Pure Markdown examples in <Code>docs-test/</Code> with <Code>cadjs</Code> code fences rendered as live CAD workbenches.
          </Text>
        </Box>

        {files.length === 0 ? (
          <DocCard>
            <Heading size="4" mb="2">No Markdown Files Found</Heading>
            <Text as="p" color="gray" size="3" mb="3">
              Add <Code>.md</Code> files to <Code>docs-test</Code>. Example: <Code>docs-test/cad-basic-test.md</Code>.
            </Text>
          </DocCard>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {files.map((file) => (
              <DocCard key={file.slug}>
                <Heading size="4" mb="1">
                  <NextLink href={`/test/cad-md/${file.slug}`}>
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
