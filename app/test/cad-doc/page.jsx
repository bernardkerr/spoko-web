'use client'

import { Box, Card, Heading, Text } from '@radix-ui/themes'
import { getAssetPath } from '@/lib/paths'
import { DocsTable } from '@/components/cad/DocsTable'

export default function CadDocsPage() {
  return (
    <Box p="4">
      <Heading size="8">OCJS Docs Helper</Heading>
      <Text as="p" color="gray" size="2">Quick reference for OCJS APIs used in this project.</Text>
      <Box mt="3">
        <Card>
          <Box p="4">
            <DocsTable markdownUrl={getAssetPath('/test/cad-doc/oc-apis.md')} />
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
