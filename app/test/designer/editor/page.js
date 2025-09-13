import { Section, Box, Heading, Text, Separator } from '@radix-ui/themes'
import SelectionProvider from '@/components/designer/SelectionProvider.jsx'
import ExplorerEditorSplit from '@/components/designer/ExplorerEditorSplit.jsx'

export default function DesignerEditorPage() {
  return (
    <Section size="4">
      <Box className="container">
        <Box mb="5">
          <Heading size="8">Designer: Editor</Heading>
          <Text as="p" color="gray" size="4">
            Object Explorer and JSON editor split view backed by the client-side store.
          </Text>
        </Box>

        <Separator my="5" size="4" />

        <SelectionProvider>
          <ExplorerEditorSplit />
        </SelectionProvider>
      </Box>
    </Section>
  )
}
