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

export default async function DocsPage() {
  const files = await getMarkdownFilesFromRoots(['docs-test'])

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Documentation</Heading>
          <Text as="p" color="gray" size="4">
            Browse our documentation powered by Markdown files from Git submodules.
          </Text>
        </Box>

        {files.length === 0 ? (
          <DocCard>
            <Heading size="4" mb="2">No Documentation Found</Heading>
            <Text as="p" color="gray" size="3" mb="3">
              Documentation files should be placed in the <Code>docs-test</Code> directory.
            </Text>
            <div className="prose dark:prose-invert">
              <p>To add documentation:</p>
              <ol>
                <li>Add your content repository as a Git submodule in <code>docs-test/</code></li>
                <li>Place your <code>.md</code> files in the submodule</li>
                <li>Include any images in an <code>images/</code> subdirectory</li>
                <li>Rebuild the site to see your documentation</li>
              </ol>
              <p>Example command to add a submodule:</p>
              <pre><code>git submodule add https://github.com/your-username/your-docs-repo.git docs-test/your-docs-repo</code></pre>
            </div>
          </DocCard>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {files.map((file) => (
              <DocCard key={file.slug}>
                <Heading size="4" mb="1">
                  <NextLink href={`/test/docs/${file.slug}`}>
                    {file.slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </NextLink>
                </Heading>
                <Text color="gray" size="2">Path: {file.slug}</Text>
              </DocCard>
            ))}
          </Grid>
        )}

        <Box mt="6">
          <div className="prose dark:prose-invert max-w-none">
            <h2>Documentation Features</h2>
            <p>
              Our documentation system supports:
            </p>
            <ul>
              <li><strong>Git Submodules:</strong> Keep documentation separate from your main codebase</li>
              <li><strong>Frontmatter:</strong> YAML metadata for titles and descriptions</li>
              <li><strong>GitHub Flavored Markdown:</strong> Tables, task lists, and more</li>
              <li><strong>Automatic Mermaid:</strong> Diagrams in <code>```mermaid</code> blocks</li>
              <li><strong>Image Support:</strong> Relative paths work with basePath</li>
              <li><strong>Typography:</strong> Beautiful styling with Tailwind Typography</li>
            </ul>
          </div>
        </Box>
      </Box>
    </Section>
  )
}
