import NextLink from 'next/link'
import {
  Section,
  Box,
  Flex,
  Heading,
  Text,
  Separator,
  Code,
  Grid,
  Card,
  Button,
} from '@radix-ui/themes'

export default function TestPage() {
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="6">
          <Heading size="8" mb="2">Radix Themes Pilot</Heading>
          <Text as="p" color="gray" size="3" mb="3">
            These components are rendered using <Code>@radix-ui/themes</Code> and inherit the global appearance.
          </Text>
          <Flex gap="3" align="center">
            <Text>Flex row</Text>
            <Separator orientation="vertical" />
            <Text color="gray">Tokenized spacing/typography</Text>
          </Flex>
        </Box>

        <Box mb="5">
          <Heading size="9">Test</Heading>
          <Text as="p" color="gray" size="4">These are test pages.</Text>
        </Box>

        <Grid columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <Card>
            <Box p="4">
              <Heading size="4" mb="1">Three.js Examples</Heading>
              <Text color="gray" size="2" mb="3">Interactive 3D graphics and animations powered by Three.js and React Three Fiber.</Text>
              <Button asChild>
                <NextLink href="/three">View Examples</NextLink>
              </Button>
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="1">Mermaid Diagrams</Heading>
              <Text color="gray" size="2" mb="3">Beautiful diagrams and flowcharts with site-themed Mermaid integration.</Text>
              <Button asChild>
                <NextLink href="/mermaid">View Diagrams</NextLink>
              </Button>
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="1">Documentation</Heading>
              <Text color="gray" size="2" mb="3">Markdown-based documentation with support for Git submodules and rich typography.</Text>
              <Button asChild>
                <NextLink href="/docs">Read Docs</NextLink>
              </Button>
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="1">Radix Design Showcase</Heading>
              <Text color="gray" size="2" mb="3">Components built with @radix-ui/themes demonstrating the site theme.</Text>
              <Button asChild>
                <NextLink href="/radix">View Showcase</NextLink>
              </Button>
            </Box>
          </Card>
        </Grid>
      </Box>
    </Section>
  )
}
