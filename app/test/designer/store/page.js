import { Section, Box, Heading, Text, Separator } from '@radix-ui/themes'
import StoreStatus from '@/components/designer/StoreStatus.jsx'

export default function DesignerStorePage() {
  return (
    <Section size="4">
      <Box className="container">
        <Box mb="5">
          <Heading size="8">Designer: Store</Heading>
          <Text as="p" color="gray" size="4">
            Explore the client-side store, seed data, resolver utilities, and manifest/reconciliation flow that power the Designer playground.
          </Text>
        </Box>

        <Separator my="5" size="4" />

        <Box>
          <Text color="gray" size="3">
            This page will host interactive demos and docs for:
          </Text>
          <ul style={{ marginTop: 8 }}>
            <li>IndexedDB adapter (docs/blobs/meta)</li>
            <li>Seed import and reset from <code>/public/seed/</code></li>
            <li>Manifest building and reconciliation</li>
            <li>Resolver helpers for <code>$id</code> and blob references</li>
          </ul>
        </Box>

        <Separator my="5" size="4" />

        <StoreStatus />
      </Box>
    </Section>
  )
}
