'use client'

import { Box, Card, Heading, Text } from '@radix-ui/themes'
import { getAssetPath } from '@/lib/paths'
import { DocsTable } from '@/components/d3/DocsTable'

export default function D3DocsPage() {
  return (
    <Box p="4">
      <Heading size="8">D3 Doc</Heading>
      <Text as="p" color="gray" size="2">Quick reference for D3 APIs used in this project.</Text>
      <Box mt="3">
        <Card>
          <Box p="4">
            <DocsTable markdownUrl={getAssetPath('/test/d3-doc/d3-apis.md')} showTitle={false} />
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
