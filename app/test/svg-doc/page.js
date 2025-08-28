'use client'

import { Box, Card, Heading, Text } from '@radix-ui/themes'
import { getAssetPath } from '@/lib/paths'
import { DocsTable } from '@/components/svg/DocsTable'

export default function SVGDocsPage() {
  return (
    <Box p="4">
      <Heading size="8">SVG Doc</Heading>
      <Text as="p" color="gray" size="2">Quick reference for SVG.js APIs used in this project.</Text>
      <Box mt="3">
        <Card>
          <Box p="4">
            <DocsTable markdownUrl={getAssetPath('/test/svg-doc/svg-apis.md')} showTitle={false} />
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
