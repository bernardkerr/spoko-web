'use client'

import { Box, Card, Heading, Text } from '@radix-ui/themes'
import { getAssetPath } from '@/lib/paths'
import { DocsTable } from '@/components/common/DocsTable'

export default function ProcessingDocsPage() {
  return (
    <Box p="4">
      <Heading size="8">Processing.js Doc</Heading>
      <Text as="p" color="gray" size="2">Quick reference for Processing.js APIs used in our examples.</Text>
      <Box mt="3">
        <Card>
          <Box p="4">
            <DocsTable markdownUrl={getAssetPath('/test/processing-doc/processing-apis.md')} showTitle={false} />
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
