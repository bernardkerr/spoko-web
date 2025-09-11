import { Section, Box, Heading, Text, Separator } from '@radix-ui/themes'
import AceProbe from '@/components/designer/AceProbe.jsx'

export default function AceCheckPage() {
  return (
    <Section size="4">
      <Box className="container">
        <Box mb="5">
          <Heading size="8">Designer: Ace Check</Heading>
          <Text as="p" color="gray" size="4">
            Probes react-ace/ace-builds compatibility under this app (React 19 + Next 15). Use the button to re-run the probe and view errors.
          </Text>
        </Box>

        <Separator my="5" size="4" />

        <AceProbe />
      </Box>
    </Section>
  )
}
